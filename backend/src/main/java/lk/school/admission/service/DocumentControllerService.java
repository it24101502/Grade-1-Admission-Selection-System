// ================================================================
//  FILE: src/main/java/lk/school/admission/service/DocumentControllerService.java
//  UPDATED: Added category slot management for parents.
//  DC can now assign which categories a parent is allowed to apply for.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.apps.ParentApplicationRepository;
import lk.school.admission.repository.apps.ParentRepository;
import lk.school.admission.repository.system.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentControllerService {

    @Autowired private ParentRepository              parentRepo;
    @Autowired private ParentApplicationRepository   parentAppRepo;
    @Autowired private MarkingSchemeRepository       schemeRepo;
    @Autowired private MarkingCriterionRepository    criterionRepo;
    @Autowired private UserRepository                userRepo;
    @Autowired private PasswordEncoder               passwordEncoder;

    // ══════════════════════════════════════════════════════
    //  PARENT MANAGEMENT
    // ══════════════════════════════════════════════════════

    /**
     * DC creates or updates a parent account.
     * - phone+NIC both new   → new parent + add category
     * - phone+NIC both match → same parent, add new category
     * - phone matches, NIC differs → error
     * - NIC matches, phone differs → error
     * - category already assigned to this parent → error
     */
    @Transactional("appsTransactionManager")
    public Map<String, Object> createParent(String phone, String nic,
                                             String childName, String category) {
        phone     = phone.trim();
        nic       = nic.trim();
        childName = childName.trim();
        category  = category.trim().toUpperCase();

        List<String> valid = List.of("CO","SIS","OG","TR","EDU","AB");
        if (!valid.contains(category))
            throw new RuntimeException("Invalid category: " + category +
                ". Must be one of: " + String.join(", ", valid));

        boolean phoneExists = parentRepo.existsByPhone(phone);
        boolean nicExists   = parentRepo.existsByNic(nic);

        Parent parent;

        if (!phoneExists && !nicExists) {
            parent = parentRepo.save(Parent.builder()
                .phone(phone).nic(nic)
                .passwordHash(passwordEncoder.encode(nic))
                .childName(childName)
                .active(true).hasChangedPassword(false)
                .build());

        } else if (phoneExists && nicExists) {
            Parent byPhone = parentRepo.findByPhone(phone)
                .orElseThrow(() -> new RuntimeException("Parent lookup failed"));
            if (!byPhone.getNic().equals(nic))
                throw new RuntimeException(
                    "Phone " + phone + " is registered with a different NIC. Please verify.");
            parent = byPhone;
            if (!childName.isBlank() && !childName.equals(parent.getChildName())) {
                parent.setChildName(childName);
                parentRepo.save(parent);
            }

        } else if (phoneExists) {
            throw new RuntimeException("Phone " + phone + " is already registered with a different NIC.");
        } else {
            throw new RuntimeException("NIC " + nic + " is already registered with a different phone.");
        }

        if (parentAppRepo.existsByParentIdAndCategory(parent.getId(), category))
            throw new RuntimeException(
                "This parent already has a " + category + " slot assigned.");

        parentAppRepo.save(ParentApplication.builder()
            .parentId(parent.getId()).category(category).build());

        List<String> allCategories = parentAppRepo.findByParentId(parent.getId())
            .stream().map(ParentApplication::getCategory).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id",          parent.getId());
        result.put("phone",       parent.getPhone());
        result.put("nic",         parent.getNic());
        result.put("childName",   parent.getChildName());
        result.put("categories",  allCategories);
        result.put("newCategory", category);
        result.put("username",    parent.getPhone());
        result.put("password",    parent.getNic());
        result.put("message",     "Category " + category + " added. Parent now has " +
                                  allCategories.size() + " slot(s).");
        return result;
    }

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllParents() {
        return parentRepo.findAll().stream().map(p -> {
            List<ParentApplication> slots = parentAppRepo.findByParentId(p.getId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",                p.getId());
            m.put("phone",             p.getPhone());
            m.put("nic",               p.getNic());
            m.put("childName",         p.getChildName());
            m.put("active",            p.isActive());
            m.put("hasChangedPassword",p.isHasChangedPassword());
            m.put("createdAt",         p.getCreatedAt().toString());
            m.put("totalSlots",        slots.size());
            m.put("filledSlots",       slots.stream().filter(s -> s.getApplicationId() != null).count());
            m.put("slots", slots.stream().map(s -> {
                Map<String, Object> sm = new LinkedHashMap<>();
                sm.put("slotId",       s.getId());
                sm.put("category",     s.getCategory());
                sm.put("hasSubmitted", s.getApplicationId() != null);
                sm.put("applicationId",s.getApplicationId());
                return sm;
            }).collect(Collectors.toList()));
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional("appsTransactionManager")
    public void resetParentPassword(Long parentId) {
        Parent p = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));
        p.setPasswordHash(passwordEncoder.encode(p.getNic()));
        p.setHasChangedPassword(false);
        parentRepo.save(p);
    }

    @Transactional("appsTransactionManager")
    public void setParentActive(Long parentId, boolean active) {
        Parent p = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found"));
        p.setActive(active);
        parentRepo.save(p);
    }

    @Transactional("appsTransactionManager")
    public void removeCategorySlot(Long slotId) {
        ParentApplication slot = parentAppRepo.findById(slotId)
            .orElseThrow(() -> new RuntimeException("Slot not found"));
        if (slot.getApplicationId() != null)
            throw new RuntimeException(
                "Cannot remove — parent has already submitted for this category.");
        parentAppRepo.delete(slot);
    }

    // ══════════════════════════════════════════════════════
    //  MARKING SCHEME MANAGEMENT
    // ══════════════════════════════════════════════════════

    @Transactional("systemTransactionManager")
    public Map<String, Object> createMarkingScheme(String category, String title,
                                                    List<Map<String, Object>> criteriaData) {
        ApplicationCategory cat = parseCategory(category);
        schemeRepo.findByCategoryAndActiveTrue(cat).ifPresent(old -> {
            old.setActive(false); schemeRepo.save(old);
        });
        MarkingScheme scheme = MarkingScheme.builder()
            .category(cat).title(title.trim()).active(true).build();
        for (int i = 0; i < criteriaData.size(); i++)
            scheme.getCriteria().add(buildCriterion(criteriaData.get(i), i, scheme));
        return schemeToMap(schemeRepo.save(scheme));
    }

    @Transactional("systemTransactionManager")
    public Map<String, Object> addCriterion(Long schemeId, Map<String, Object> data) {
        MarkingScheme scheme = schemeRepo.findById(schemeId)
            .orElseThrow(() -> new RuntimeException("Scheme not found"));
        scheme.getCriteria().add(buildCriterion(data, scheme.getCriteria().size(), scheme));
        return schemeToMap(schemeRepo.save(scheme));
    }

    @Transactional("systemTransactionManager")
    public void removeCriterion(Long criterionId) {
        MarkingCriterion mc = criterionRepo.findById(criterionId)
            .orElseThrow(() -> new RuntimeException("Criterion not found"));
        MarkingScheme scheme = mc.getScheme();
        scheme.getCriteria().remove(mc);
        for (int i = 0; i < scheme.getCriteria().size(); i++)
            scheme.getCriteria().get(i).setDisplayOrder(i);
        schemeRepo.save(scheme);
    }

    @Transactional("systemTransactionManager")
    public Map<String, Object> updateScheme(Long schemeId, Map<String, Object> updates) {
        MarkingScheme scheme = schemeRepo.findById(schemeId)
            .orElseThrow(() -> new RuntimeException("Scheme not found"));
        if (updates.containsKey("title"))
            scheme.setTitle(updates.get("title").toString().trim());
        if (updates.containsKey("active")) {
            boolean newActive = Boolean.parseBoolean(updates.get("active").toString());
            if (newActive) schemeRepo.findByCategoryAndActiveTrue(scheme.getCategory()).ifPresent(other -> {
                if (!other.getId().equals(schemeId)) { other.setActive(false); schemeRepo.save(other); }
            });
            scheme.setActive(newActive);
        }
        return schemeToMap(schemeRepo.save(scheme));
    }

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getActiveScheme(String category) {
        return schemeToMap(schemeRepo
            .findActiveSchemeByCategoryWithCriteria(parseCategory(category))
            .orElseThrow(() -> new RuntimeException("No active scheme for: " + category)));
    }

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllSchemes() {
        return schemeRepo.findAll().stream().map(this::schemeToMap).collect(Collectors.toList());
    }

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getSchemesSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        for (ApplicationCategory cat : ApplicationCategory.values()) {
            Map<String, Object> info = new LinkedHashMap<>();
            schemeRepo.findByCategoryAndActiveTrue(cat).ifPresentOrElse(s -> {
                info.put("hasActiveScheme", true);
                info.put("schemeId",        s.getId());
                info.put("title",           s.getTitle());
                info.put("criteriaCount",   s.getCriteria().size());
                info.put("totalPossible",   s.getTotalPossibleMarks());
                info.put("createdAt",       s.getCreatedAt().toString());
            }, () -> info.put("hasActiveScheme", false));
            summary.put(cat.name(), info);
        }
        return summary;
    }

    @Transactional(value = "systemTransactionManager", readOnly = true)
    public List<Map<String, Object>> getSchemeHistory(String category) {
        return schemeRepo.findByCategoryOrderByCreatedAtDesc(parseCategory(category))
            .stream().map(this::schemeToMap).collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────

    private MarkingCriterion buildCriterion(Map<String, Object> data, int order, MarkingScheme scheme) {
        String title   = Objects.requireNonNull(data.get("title"), "title required").toString().trim();
        String typeStr = Objects.requireNonNull(data.get("fieldType"), "fieldType required")
                                .toString().trim().toUpperCase();
        MarkFieldType fieldType;
        try { fieldType = MarkFieldType.valueOf(typeStr); }
        catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid fieldType: " + typeStr +
                ". Must be NUMBER_ONLY, COMMENT_ONLY, or NUMBER_AND_COMMENT");
        }
        Double maxScore = null;
        if (fieldType != MarkFieldType.COMMENT_ONLY) {
            maxScore = Double.parseDouble(
                Objects.requireNonNull(data.get("maxScore"), "maxScore required").toString());
            if (maxScore <= 0) throw new RuntimeException("maxScore must be > 0");
        }
        String desc = data.containsKey("description") && data.get("description") != null
            ? data.get("description").toString().trim() : null;
        return MarkingCriterion.builder()
            .scheme(scheme).title(title).fieldType(fieldType)
            .maxScore(maxScore).description(desc).displayOrder(order).build();
    }

    private ApplicationCategory parseCategory(String cat) {
        try { return ApplicationCategory.valueOf(cat.trim().toUpperCase()); }
        catch (IllegalArgumentException e) { throw new RuntimeException("Invalid category: " + cat); }
    }

    private Map<String, Object> schemeToMap(MarkingScheme s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",            s.getId());
        m.put("category",      s.getCategory().name());
        m.put("title",         s.getTitle());
        m.put("active",        s.isActive());
        m.put("createdAt",     s.getCreatedAt().toString());
        m.put("totalPossible", s.getTotalPossibleMarks());
        m.put("criteria", s.getCriteria().stream().map(c -> {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id",           c.getId());
            cm.put("title",        c.getTitle());
            cm.put("fieldType",    c.getFieldType().name());
            cm.put("maxScore",     c.getMaxScore());
            cm.put("description",  c.getDescription());
            cm.put("displayOrder", c.getDisplayOrder());
            return cm;
        }).collect(Collectors.toList()));
        m.put("criteriaCount", s.getCriteria().size());
        return m;
    }
}