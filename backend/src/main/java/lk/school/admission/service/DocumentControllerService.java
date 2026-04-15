// ================================================================
//  FILE: src/main/java/lk/school/admission/service/DocumentControllerService.java
//  UPDATED: Added category slot management for parents.
//  DC can now assign which categories a parent is allowed to apply for.
// ================================================================
package lk.school.admission.service;

import lk.school.admission.entity.apps.ParentAccount;
import lk.school.admission.entity.system.*;
import lk.school.admission.repository.apps.ParentAccountRepository;
import lk.school.admission.repository.apps.ApplicationRepository;
import lk.school.admission.repository.system.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class DocumentControllerService {

    @Autowired private ParentAccountRepository  parentRepo;
    @Autowired private ApplicationRepository    appRepo;
    @Autowired private MarkingSchemeRepository  schemeRepo;
    @Autowired private MarkingCriterionRepository criterionRepo;
    @Autowired private JudgeRepository          judgeRepo;
    @Autowired private PasswordEncoder          passwordEncoder;

    // ════════════════════════════════════════════════════════════
    //  PARENT ACCOUNT MANAGEMENT
    // ════════════════════════════════════════════════════════════

    /**
     * DC creates a parent account.
     * Fields: phone (username), NIC (initial password), childName, category.
     */
    @Transactional("appsTransactionManager")
    public Map<String, Object> createParentAccount(String phone, String nic,
                                                    String childName, String category) {
        phone     = phone.trim();
        nic       = nic.trim();
        childName = childName.trim();
        category  = category.trim().toUpperCase();

        // Validate category
        List<String> validCats = List.of("CO","SIS","OG","TR","EDU","AB");
        if (!validCats.contains(category))
            throw new RuntimeException("Invalid category: " + category +
                ". Must be one of: " + String.join(", ", validCats));

        if (parentRepo.existsByPhone(phone))
            throw new RuntimeException("An account with phone number " + phone + " already exists");
        if (parentRepo.existsByNic(nic))
            throw new RuntimeException("An account with NIC " + nic + " already exists");

        ParentAccount parent = ParentAccount.builder()
            .phone(phone)
            .nic(nic)
            .passwordHash(passwordEncoder.encode(nic))   // initial password = NIC
            .childName(childName)
            .category(category)
            .active(true)
            .hasChangedPassword(false)
            .build();

        ParentAccount saved = parentRepo.save(parent);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("id",          saved.getId());
        result.put("phone",       saved.getPhone());
        result.put("nic",         saved.getNic());
        result.put("childName",   saved.getChildName());
        result.put("category",    saved.getCategory());
        result.put("username",    saved.getPhone());       // remind DC: username = phone
        result.put("password",    saved.getNic());         // remind DC: password = NIC
        result.put("message",     "Parent account created. Username: " + phone + ", Password: " + nic);
        return result;
    }

    /**
     * List all parent accounts with their submission status.
     */
    @Transactional(value = "appsTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllParents() {
        return parentRepo.findAll().stream().map(p -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id",                p.getId());
            m.put("phone",             p.getPhone());
            m.put("nic",               p.getNic());
            m.put("childName",         p.getChildName());
            m.put("category",          p.getCategory());
            m.put("active",            p.isActive());
            m.put("hasChangedPassword",p.isHasChangedPassword());
            m.put("applicationId",     p.getApplicationId());
            m.put("hasSubmitted",      p.getApplicationId() != null);
            m.put("createdAt",         p.getCreatedAt().toString());
            return m;
        }).collect(Collectors.toList());
    }

    /** Reset a parent's password back to their NIC */
    @Transactional("appsTransactionManager")
    public void resetParentPassword(Long parentId) {
        ParentAccount p = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found: " + parentId));
        p.setPasswordHash(passwordEncoder.encode(p.getNic()));
        p.setHasChangedPassword(false);
        parentRepo.save(p);
    }

    /** Activate or deactivate a parent account */
    @Transactional("appsTransactionManager")
    public void setParentActive(Long parentId, boolean active) {
        ParentAccount p = parentRepo.findById(parentId)
            .orElseThrow(() -> new RuntimeException("Parent not found: " + parentId));
        p.setActive(active);
        parentRepo.save(p);
    }

    // ════════════════════════════════════════════════════════════
    //  MARKING SCHEME MANAGEMENT
    // ════════════════════════════════════════════════════════════

    /**
     * Create a new marking scheme for a specific judge category.
     * Each judge has their OWN scheme — different criteria, different weights.
     *
     * If a scheme already exists for that category, the old one is deactivated
     * and this new one becomes active.
     *
     * @param category   e.g. "CO"
     * @param title      e.g. "CO Category Marking Scheme 2025"
     * @param criteria   List of criterion definitions from the request body
     */
    @Transactional("systemTransactionManager")
    public Map<String, Object> createMarkingScheme(String category,
                                                    String title,
                                                    List<Map<String, Object>> criteria) {
        ApplicationCategory cat = parseCategory(category);

        // Deactivate any existing active scheme for this category
        schemeRepo.findByCategoryAndActiveTrue(cat).ifPresent(existing -> {
            existing.setActive(false);
            schemeRepo.save(existing);
        });

        // Build the new scheme
        MarkingScheme scheme = MarkingScheme.builder()
            .category(cat)
            .title(title.trim())
            .active(true)
            .build();

        // Build criteria
        List<MarkingCriterion> criterionList = new ArrayList<>();
        for (int i = 0; i < criteria.size(); i++) {
            Map<String, Object> c = criteria.get(i);
            MarkingCriterion mc = buildCriterion(c, i, scheme);
            criterionList.add(mc);
        }
        scheme.getCriteria().addAll(criterionList);

        MarkingScheme saved = schemeRepo.save(scheme);
        return schemeToMap(saved);
    }

    /**
     * Add a single criterion to an existing scheme.
     */
    @Transactional("systemTransactionManager")
    public Map<String, Object> addCriterion(Long schemeId, Map<String, Object> criterionData) {
        MarkingScheme scheme = schemeRepo.findById(schemeId)
            .orElseThrow(() -> new RuntimeException("Scheme not found: " + schemeId));

        int nextOrder = scheme.getCriteria().size();
        MarkingCriterion mc = buildCriterion(criterionData, nextOrder, scheme);
        scheme.getCriteria().add(mc);
        schemeRepo.save(scheme);

        return schemeToMap(scheme);
    }

    /**
     * Remove a criterion from a scheme.
     */
    @Transactional("systemTransactionManager")
    public void removeCriterion(Long criterionId) {
        MarkingCriterion mc = criterionRepo.findById(criterionId)
            .orElseThrow(() -> new RuntimeException("Criterion not found: " + criterionId));
        MarkingScheme scheme = mc.getScheme();
        scheme.getCriteria().remove(mc);
        // Re-order remaining criteria
        for (int i = 0; i < scheme.getCriteria().size(); i++) {
            scheme.getCriteria().get(i).setDisplayOrder(i);
        }
        schemeRepo.save(scheme);
    }

    /**
     * Update scheme title or active status.
     */
    @Transactional("systemTransactionManager")
    public Map<String, Object> updateScheme(Long schemeId, Map<String, Object> updates) {
        MarkingScheme scheme = schemeRepo.findById(schemeId)
            .orElseThrow(() -> new RuntimeException("Scheme not found: " + schemeId));

        if (updates.containsKey("title"))
            scheme.setTitle(updates.get("title").toString().trim());

        if (updates.containsKey("active")) {
            boolean newActive = Boolean.parseBoolean(updates.get("active").toString());
            // If activating, deactivate other schemes for this category first
            if (newActive) {
                schemeRepo.findByCategoryAndActiveTrue(scheme.getCategory()).ifPresent(other -> {
                    if (!other.getId().equals(schemeId)) {
                        other.setActive(false);
                        schemeRepo.save(other);
                    }
                });
            }
            scheme.setActive(newActive);
        }

        return schemeToMap(schemeRepo.save(scheme));
    }

    /**
     * Get the active marking scheme for a category (with criteria).
     */
    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getActiveScheme(String category) {
        ApplicationCategory cat = parseCategory(category);
        MarkingScheme scheme = schemeRepo
            .findActiveSchemeByCategoryWithCriteria(cat)
            .orElseThrow(() -> new RuntimeException(
                "No active marking scheme found for category: " + category));
        return schemeToMap(scheme);
    }

    /**
     * Get all schemes (all categories, active and historical).
     */
    @Transactional(value = "systemTransactionManager", readOnly = true)
    public List<Map<String, Object>> getAllSchemes() {
        return schemeRepo.findAll().stream()
            .map(this::schemeToMap)
            .collect(Collectors.toList());
    }

    /**
     * Get all schemes grouped by category, showing active scheme per category.
     */
    @Transactional(value = "systemTransactionManager", readOnly = true)
    public Map<String, Object> getSchemesSummary() {
        Map<String, Object> summary = new LinkedHashMap<>();
        for (ApplicationCategory cat : ApplicationCategory.values()) {
            Optional<MarkingScheme> active = schemeRepo.findByCategoryAndActiveTrue(cat);
            Map<String, Object> catInfo = new LinkedHashMap<>();
            catInfo.put("hasActiveScheme", active.isPresent());
            if (active.isPresent()) {
                MarkingScheme s = active.get();
                catInfo.put("schemeId",      s.getId());
                catInfo.put("title",         s.getTitle());
                catInfo.put("criteriaCount", s.getCriteria().size());
                catInfo.put("totalPossible", s.getTotalPossibleMarks());
                catInfo.put("createdAt",     s.getCreatedAt().toString());
            }
            summary.put(cat.name(), catInfo);
        }
        return summary;
    }

    /**
     * Get all historical versions of schemes for a specific category.
     */
    @Transactional(value = "systemTransactionManager", readOnly = true)
    public List<Map<String, Object>> getSchemeHistory(String category) {
        ApplicationCategory cat = parseCategory(category);
        return schemeRepo.findByCategoryOrderByCreatedAtDesc(cat)
            .stream().map(this::schemeToMap).collect(Collectors.toList());
    }

    // ════════════════════════════════════════════════════════════
    //  PRIVATE HELPERS
    // ════════════════════════════════════════════════════════════

    private MarkingCriterion buildCriterion(Map<String, Object> data,
                                             int order,
                                             MarkingScheme scheme) {
        String titleVal = Objects.requireNonNull(data.get("title"), "Criterion title is required")
                                 .toString().trim();
        String typeStr  = Objects.requireNonNull(data.get("fieldType"), "fieldType is required")
                                 .toString().trim().toUpperCase();

        MarkFieldType fieldType;
        try {
            fieldType = MarkFieldType.valueOf(typeStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid fieldType: " + typeStr +
                ". Must be NUMBER_ONLY, COMMENT_ONLY, or NUMBER_AND_COMMENT");
        }

        Double maxScore = null;
        if (fieldType != MarkFieldType.COMMENT_ONLY) {
            Object ms = data.get("maxScore");
            if (ms == null)
                throw new RuntimeException("maxScore is required for numeric criteria");
            try {
                maxScore = Double.parseDouble(ms.toString());
                if (maxScore <= 0)
                    throw new RuntimeException("maxScore must be greater than 0");
            } catch (NumberFormatException e) {
                throw new RuntimeException("maxScore must be a number");
            }
        }

        String description = data.containsKey("description")
            ? data.get("description").toString().trim() : null;

        return MarkingCriterion.builder()
            .scheme(scheme)
            .title(titleVal)
            .fieldType(fieldType)
            .maxScore(maxScore)
            .description(description)
            .displayOrder(order)
            .build();
    }

    private ApplicationCategory parseCategory(String category) {
        try {
            return ApplicationCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid category: " + category +
                ". Must be one of: CO, SIS, OG, TR, EDU, AB");
        }
    }

    private Map<String, Object> schemeToMap(MarkingScheme s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id",           s.getId());
        m.put("category",     s.getCategory().name());
        m.put("title",        s.getTitle());
        m.put("active",       s.isActive());
        m.put("createdAt",    s.getCreatedAt().toString());
        m.put("totalPossible", s.getTotalPossibleMarks());

        List<Map<String, Object>> criteriaList = s.getCriteria().stream().map(c -> {
            Map<String, Object> cm = new LinkedHashMap<>();
            cm.put("id",           c.getId());
            cm.put("title",        c.getTitle());
            cm.put("fieldType",    c.getFieldType().name());
            cm.put("maxScore",     c.getMaxScore());
            cm.put("description",  c.getDescription());
            cm.put("displayOrder", c.getDisplayOrder());
            return cm;
        }).collect(Collectors.toList());

        m.put("criteria",     criteriaList);
        m.put("criteriaCount",criteriaList.size());
        return m;
    }
}