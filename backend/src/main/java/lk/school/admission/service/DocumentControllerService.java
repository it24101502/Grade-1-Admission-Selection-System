// ================================================================
//  FILE: src/main/java/lk/school/admission/service/DocumentControllerService.java
//  UPDATED: Full multi-child support.
//
//  DC registration flow:
//  STEP 1 — checkParent(phone, nic, childName, category)
//    Returns a "confirmation payload" describing what will happen.
//    The DC reviews it and confirms or cancels.
//
//  STEP 2 — confirmCreateSlot(phone, nic, childName, category)
//    Executes the action: creates parent/child if needed, adds the slot.
//
//  Conflict cases handled:
//    a) phone exists, NIC differs          → error (wrong NIC for this phone)
//    b) NIC exists, phone differs          → error (wrong phone for this NIC)
//    c) phone+NIC match (same parent)      → confirm if child is correct/new
//    d) everything new                     → create parent + child + slot
//    e) slot (parent+child+cat) exists     → error (duplicate)
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.*;
import lk.school.admission.repository.system.ParentApplicationRepository;
import lk.school.admission.repository.system.ParentChildRepository;
import lk.school.admission.repository.system.ParentRepository;
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
    @Autowired private ParentChildRepository         parentChildRepo;
    @Autowired private ParentApplicationRepository   parentAppRepo;
    @Autowired private MarkingSchemeRepository       schemeRepo;
    @Autowired private MarkingCriterionRepository    criterionRepo;
    @Autowired private UserRepository                userRepo;
    @Autowired private PasswordEncoder               passwordEncoder;

    private static final List<String> VALID_CATEGORIES =
        List.of("CO", "SIS", "OG", "TR", "EDU", "AB");

    // ══════════════════════════════════════════════════════
    //  STEP 1 — CHECK (read-only, no writes)
    //  Returns a confirmation payload the DC must review before committing.
    // ══════════════════════════════════════════════════════

    /**
     * Dry-run check. No data is written.
     * Returns a map describing what will happen if the DC confirms.
     *
     * Response fields:
     *   status       : "NEW_PARENT" | "EXISTING_PARENT_NEW_CHILD" |
     *                  "EXISTING_PARENT_EXISTING_CHILD" | "ERROR"
     *   message      : human-readable summary for the DC to review
     *   conflicts    : list of conflict strings (non-empty only when status=ERROR)
     *   parentExists : boolean
     *   childExists  : boolean
     *   slotExists   : boolean
     *   existingChildren : list of child names already under this parent (if parent exists)
     */
    @Transactional(value = "appsTransactionManager", readOnly = true)
    public Map<String, Object> checkParent(String phone, String nic,
                                            String childName, String category) {
        phone     = phone.trim();
        nic       = nic.trim();
        childName = childName.trim();
        category  = category.trim().toUpperCase();

        Map<String, Object> result = new LinkedHashMap<>();
        List<String> conflicts = new ArrayList<>();

        // Validate category
        if (!VALID_CATEGORIES.contains(category)) {
            result.put("status",    "ERROR");
            result.put("message",   "Invalid category: " + category +
                ". Must be one of: " + String.join(", ", VALID_CATEGORIES));
            result.put("conflicts", List.of("Invalid category"));
            return result;
        }

        boolean phoneExists = parentRepo.existsByPhone(phone);
        boolean nicExists   = parentRepo.existsByNic(nic);

        // ── Conflict case a: phone matches but NIC is different ──
        if (phoneExists && !nicExists) {
            conflicts.add("Phone " + phone + " is already registered with a different NIC.");
        }

        // ── Conflict case b: NIC matches but phone is different ──
        if (nicExists && !phoneExists) {
            conflicts.add("NIC " + nic + " is already registered with a different phone number.");
        }

        if (!conflicts.isEmpty()) {
            result.put("status",    "ERROR");
            result.put("message",   "Cannot proceed — identity conflict detected. Please verify the details.");
            result.put("conflicts", conflicts);
            return result;
        }

        // ── Same parent (both match) or brand new parent ──
        boolean parentExists = phoneExists && nicExists;
        result.put("parentExists", parentExists);
        result.put("phone",        phone);
        result.put("nic",          nic);
        result.put("childName",    childName);
        result.put("category",     category);

        if (parentExists) {
            Parent existing = parentRepo.findByPhoneAndNic(phone, nic).get();
            List<ParentChild> existingChildren = parentChildRepo.findByParentId(existing.getId());
            List<String> childNames = existingChildren.stream()
                .map(ParentChild::getChildName).collect(Collectors.toList());

            result.put("parentId",        existing.getId());
            result.put("existingChildren", childNames);

            boolean childExists = parentChildRepo
                .existsByParentIdAndChildName(existing.getId(), childName);
            result.put("childExists", childExists);

            if (childExists) {
                ParentChild child = parentChildRepo
                    .findByParentIdAndChildName(existing.getId(), childName).get();
                boolean slotExists = parentAppRepo
                    .existsByParentIdAndChildIdAndCategory(existing.getId(), child.getId(), category);
                result.put("slotExists", slotExists);

                if (slotExists) {
                    result.put("status",  "ERROR");
                    result.put("message", "This parent already has a " + category +
                        " slot assigned for child \"" + childName + "\". No action needed.");
                    result.put("conflicts", List.of("Duplicate slot: " + childName + " / " + category));
                    return result;
                }

                result.put("status",  "EXISTING_PARENT_EXISTING_CHILD");
                result.put("message", "Parent already exists. Child \"" + childName +
                    "\" is already registered under this account. " +
                    "A new " + category + " slot will be added for this child.");
            } else {
                result.put("childExists", false);
                result.put("slotExists",  false);
                result.put("status",  "EXISTING_PARENT_NEW_CHILD");
                result.put("message", "Parent already exists with " + childNames.size() +
                    " child(ren): " + String.join(", ", childNames) +
                    ". A new child \"" + childName + "\" will be registered and a " +
                    category + " slot will be created for them.");
            }
        } else {
            result.put("parentExists", false);
            result.put("childExists",  false);
            result.put("slotExists",   false);
            result.put("existingChildren", List.of());
            result.put("status",  "NEW_PARENT");
            result.put("message", "No existing account found. A new parent account will be created " +
                "for " + phone + " / " + nic + ", child \"" + childName +
                "\" will be registered, and a " + category + " slot will be created.");
        }

        return result;
    }

    // ══════════════════════════════════════════════════════
    //  STEP 2 — CONFIRM & COMMIT (writes to DB)
    //  DC has reviewed the checkParent response and clicked "Confirm".
    // ══════════════════════════════════════════════════════

    /**
     * Executes the registration. Called after the DC confirms the checkParent summary.
     * Idempotent for parent and child creation — only the slot is strictly new.
     */
    @Transactional("appsTransactionManager")
    public Map<String, Object> confirmCreateSlot(String phone, String nic,
                                                  String childName, String category) {
        // Use final locals so they can be captured inside lambdas below
        final String cleanPhone     = phone.trim();
        final String cleanNic       = nic.trim();
        final String cleanChildName = childName.trim();
        final String cleanCategory  = category.trim().toUpperCase();

        if (!VALID_CATEGORIES.contains(cleanCategory))
            throw new RuntimeException("Invalid category: " + cleanCategory);

        // ── 1. Get or create parent ──
        Parent parent = parentRepo.findByPhoneAndNic(cleanPhone, cleanNic).orElseGet(() -> {
            boolean phoneExists = parentRepo.existsByPhone(cleanPhone);
            boolean nicExists   = parentRepo.existsByNic(cleanNic);
            if (phoneExists)
                throw new RuntimeException("Phone " + cleanPhone + " is registered with a different NIC.");
            if (nicExists)
                throw new RuntimeException("NIC " + cleanNic + " is registered with a different phone.");
            return parentRepo.save(Parent.builder()
                .phone(cleanPhone).nic(cleanNic)
                .passwordHash(passwordEncoder.encode(cleanNic))
                .active(true).hasChangedPassword(false)
                .build());
        });

        // ── 2. Get or create child ──
        ParentChild child = parentChildRepo
            .findByParentIdAndChildName(parent.getId(), cleanChildName)
            .orElseGet(() -> parentChildRepo.save(ParentChild.builder()
                .parentId(parent.getId())
                .childName(cleanChildName)
                .build()));

        // ── 3. Create slot (must not already exist) ──
        if (parentAppRepo.existsByParentIdAndChildIdAndCategory(
                parent.getId(), child.getId(), cleanCategory))
            throw new RuntimeException("Slot already exists for child \"" +
                cleanChildName + "\" in category " + cleanCategory);

        parentAppRepo.save(ParentApplication.builder()
            .parentId(parent.getId())
            .childId(child.getId())
            .category(cleanCategory)
            .build());

        // ── 4. Build response ──
        List<ParentChild> allChildren = parentChildRepo.findByParentId(parent.getId());
        List<Map<String, Object>> childSummary = allChildren.stream().map(c -> {
            List<ParentApplication> slots = parentAppRepo
                .findByParentIdAndChildId(parent.getId(), c.getId());
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("childId",   c.getId());
            cm.put("childName", c.getChildName());
            cm.put("slots", slots.stream().map(s -> {
                Map<String, Object> sm = new LinkedHashMap<>();
                sm.put("slotId",       s.getId());
                sm.put("category",     s.getCategory());
                sm.put("hasSubmitted", s.getApplicationId() != null);
                return sm;
            }).collect(Collectors.toList()));
            return cm;
        }).collect(Collectors.toList());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("parentId",    parent.getId());
        result.put("phone",       parent.getPhone());
        result.put("nic",         parent.getNic());
        result.put("username",    parent.getPhone());
        result.put("password",    parent.getNic());  // shown only on first creation
        result.put("newChild",    child.getChildName());
        result.put("newCategory", cleanCategory);
        result.put("children",    childSummary);
        result.put("message",     "Slot created: \"" + cleanChildName + "\" / " + cleanCategory);
        return result;
    }

    // ══════════════════════════════════════════════════════
    //  READ / MANAGEMENT
    // ══════════════════════════════════════════════════════

    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllParents() {
        return parentRepo.findAll().stream().map(p -> {
            List<ParentChild> children = parentChildRepo.findByParentId(p.getId());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",                 p.getId());
            m.put("phone",              p.getPhone());
            m.put("nic",                p.getNic());
            m.put("active",             p.isActive());
            m.put("hasChangedPassword", p.isHasChangedPassword());
            m.put("createdAt",          p.getCreatedAt().toString());
            m.put("children", children.stream().map(c -> {
                List<ParentApplication> slots =
                    parentAppRepo.findByParentIdAndChildId(p.getId(), c.getId());
                Map<String, Object> cm = new LinkedHashMap<>();
                cm.put("childId",   c.getId());
                cm.put("childName", c.getChildName());
                cm.put("totalSlots", slots.size());
                cm.put("filledSlots", slots.stream()
                    .filter(s -> s.getApplicationId() != null).count());
                cm.put("slots", slots.stream().map(s -> {
                    Map<String, Object> sm = new LinkedHashMap<>();
                    sm.put("slotId",        s.getId());
                    sm.put("category",      s.getCategory());
                    sm.put("hasSubmitted",  s.getApplicationId() != null);
                    sm.put("applicationId", s.getApplicationId());
                    return sm;
                }).collect(Collectors.toList()));
                return cm;
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
    //  MARKING SCHEME MANAGEMENT (unchanged)
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
            if (newActive) schemeRepo.findByCategoryAndActiveTrue(scheme.getCategory())
                .ifPresent(other -> {
                    if (!other.getId().equals(schemeId)) {
                        other.setActive(false); schemeRepo.save(other);
                    }
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

    private MarkingCriterion buildCriterion(Map<String, Object> data, int order,
                                             MarkingScheme scheme) {
        String title   = Objects.requireNonNull(data.get("title"), "title required")
                                .toString().trim();
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
        catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category: " + cat);
        }
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