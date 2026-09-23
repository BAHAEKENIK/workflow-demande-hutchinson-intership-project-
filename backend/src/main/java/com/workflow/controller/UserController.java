package com.workflow.controller;

import com.workflow.repository.HistoriqueRepository;
import com.workflow.entity.Historique;
import com.workflow.dto.HistoriqueDto;
import com.workflow.dto.MessageResponse;
import com.workflow.dto.ProfileUpdateDto;
import com.workflow.dto.UserDto;
import com.workflow.entity.Department;
import java.util.Map;
import com.workflow.entity.Role;
import com.workflow.entity.User;
import com.workflow.repository.DepartmentRepository;
import com.workflow.repository.UserRepository;
import com.workflow.service.UserService;
import com.workflow.service.DemandeService;
import com.workflow.dto.request.DeleteUserRequest;
import com.workflow.dto.request.BulkDeleteUserRequest;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final HistoriqueRepository historiqueRepository;
    private final DemandeService demandeService;

    public UserController(UserService userService,
                          UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          PasswordEncoder passwordEncoder,
                          HistoriqueRepository historiqueRepository,
                          DemandeService demandeService) {
        this.userService = userService;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.historiqueRepository = historiqueRepository;
        this.demandeService = demandeService;
    }

    // ========== PROFIL ==========
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile() {
        User current = userService.getCurrentUser();
        return ResponseEntity.ok(toDto(current));
    }

    @PutMapping("/profile")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody ProfileUpdateDto profileDto) {
        User current = userService.getCurrentUser();
        current.setFirstName(profileDto.getFirstName());
        current.setLastName(profileDto.getLastName());
        current.setEmail(profileDto.getEmail());
        User saved = userRepository.save(current);
        return ResponseEntity.ok(toDto(saved));
    }

    // ========== ADMIN ==========
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        // Filtrer les utilisateurs actifs uniquement
        List<UserDto> dtos = userRepository.findAllByActiveTrue()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return ResponseEntity.ok(toDto(user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> createUser(@Valid @RequestBody UserDto userDto) {

        if (userRepository.existsByUsername(userDto.getUsername())) {
            throw new RuntimeException("Nom d'utilisateur déjà pris");
        }

        if (userRepository.existsByEmail(userDto.getEmail())) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setPassword(passwordEncoder.encode("changeme"));
        user.setEmail(userDto.getEmail());
        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setRole(Role.valueOf(userDto.getRole()));
        user.setActive(true); // Nouvel utilisateur actif par défaut

        if (userDto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(userDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Département non trouvé"));
            user.setDepartment(dept);
        }

        user.setFirstLogin(true);

        User saved = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> updateUser(@PathVariable Long id,
                                            @Valid @RequestBody UserDto userDto) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérifier l'unicité du username (si changé)
        if (!user.getUsername().equals(userDto.getUsername())) {
            if (userRepository.existsByUsername(userDto.getUsername())) {
                throw new RuntimeException("Nom d'utilisateur déjà pris");
            }
            user.setUsername(userDto.getUsername());
        }

        user.setFirstName(userDto.getFirstName());
        user.setLastName(userDto.getLastName());
        user.setEmail(userDto.getEmail());
        user.setRole(Role.valueOf(userDto.getRole()));

        if (userDto.getDepartmentId() != null) {
            Department dept = departmentRepository.findById(userDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Département non trouvé"));
            user.setDepartment(dept);
        } else {
            user.setDepartment(null);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toDto(saved));
    }

    // Demande de suppression d'un utilisateur (simple)
    // Maintenant accessible à ADMIN et CHEF_DEPT (avec vérification département RH)
    @PostMapping("/{id}/delete-request")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHEF_DEPT')")
    public ResponseEntity<?> requestDeleteUser(@PathVariable Long id, @Valid @RequestBody DeleteUserRequest request) {
        User currentUser = userService.getCurrentUser();
        User toDelete = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        // Vérification pour les CHEF_DEPT : ils doivent appartenir au département RH
        if (currentUser.getRole() == Role.CHEF_DEPT) {
            Department rhDept = departmentRepository.findByName("RH")
                    .orElseThrow(() -> new RuntimeException("Département RH non trouvé"));
            if (!currentUser.getDepartment().getId().equals(rhDept.getId())) {
                throw new AccessDeniedException("Seul le responsable RH peut demander une suppression.");
            }
        }

        // Empêcher la suppression du dernier admin (si l'utilisateur connecté est admin et tente de se supprimer lui-même)
        if (currentUser.getId().equals(id) && currentUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.isActive())
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Impossible de supprimer le seul compte ADMIN"));
            }
        }

        demandeService.createDeleteUserDemande(id, request.getCommentaire());
        return ResponseEntity.ok(new MessageResponse("Demande de suppression créée, en attente de validation par le responsable RH"));
    }

    // Demande de suppression en masse (bulk)
    @PostMapping("/bulk-delete-request")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHEF_DEPT')")
    public ResponseEntity<?> bulkRequestDeleteUser(@Valid @RequestBody BulkDeleteUserRequest request) {
        User currentUser = userService.getCurrentUser();

        // Vérification pour les CHEF_DEPT : ils doivent appartenir au département RH
        if (currentUser.getRole() == Role.CHEF_DEPT) {
            Department rhDept = departmentRepository.findByName("RH")
                    .orElseThrow(() -> new RuntimeException("Département RH non trouvé"));
            if (!currentUser.getDepartment().getId().equals(rhDept.getId())) {
                throw new AccessDeniedException("Seul le responsable RH peut demander une suppression.");
            }
        }

        // Empêcher la suppression du seul admin si son ID est dans la liste
        if (request.getUserIds().contains(currentUser.getId()) && currentUser.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && u.isActive())
                    .count();
            if (adminCount <= 1) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Impossible de supprimer le seul compte ADMIN"));
            }
        }

        demandeService.createBulkDeleteUserDemandes(request.getUserIds(), request.getCommentaire());
        return ResponseEntity.ok(new MessageResponse("Demandes de suppression créées, en attente de validation par le responsable RH"));
    }

    // ========== PAGINATION (avec filtre actif) ==========
    @GetMapping("/paginated")
    @PreAuthorize("hasRole('ADMIN') or hasRole('CHEF_DEPT')")
    public ResponseEntity<Page<UserDto>> getUsersPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {

        User currentUser = userService.getCurrentUser();

        // Vérification pour les CHEF_DEPT : ils doivent être du département RH
        if (currentUser.getRole() == Role.CHEF_DEPT) {
            Department rhDept = departmentRepository.findByName("RH")
                    .orElseThrow(() -> new RuntimeException("Département RH non trouvé"));
            if (!currentUser.getDepartment().getId().equals(rhDept.getId())) {
                throw new AccessDeniedException("Accès refusé : vous n'êtes pas responsable RH.");
            }
        }

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "id"));
        Page<User> userPage;

        if (keyword != null && !keyword.isBlank()) {
            userPage = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCaseAndActiveTrue(
                    keyword, keyword, keyword, pageable);
        } else {
            userPage = userRepository.findAllByActiveTrue(pageable);
        }

        if (role != null && !role.isBlank()) {
            List<User> filtered = userPage.getContent().stream()
                    .filter(u -> u.getRole().name().equals(role))
                    .collect(Collectors.toList());
            userPage = new PageImpl<>(filtered, pageable, filtered.size());
        }

        Page<UserDto> dtoPage = userPage.map(this::toDto);
        return ResponseEntity.ok(dtoPage);
    }

    // ========== DTO MAPPING ==========
    private UserDto toDto(User user) {
        UserDto dto = new UserDto();

        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());

        dto.setRole(user.getRole().name());

        if (user.getRole() == Role.ADMIN) {
            if (user.getDepartment() != null) {
                dto.setDisplayRole("Chef département " + user.getDepartment().getName());
            } else {
                dto.setDisplayRole("Chef département");
            }
        } else {
            dto.setDisplayRole(user.getRole().name());
        }

        dto.setFirstLogin(user.isFirstLogin());
        dto.setActive(user.isActive());

        if (user.getDepartment() != null) {
            dto.setDepartmentId(user.getDepartment().getId());
            dto.setDepartmentName(user.getDepartment().getName());
        }

        return dto;
    }

    // ========== UTILITAIRES POUR CHEF DEPT / ADMIN ==========
    @GetMapping("/by-department/{departmentId}")
    @PreAuthorize("hasRole('CHEF_DEPT') or hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> getEmployeesByDepartment(@PathVariable Long departmentId) {
        List<User> employees = userRepository.findByDepartmentIdAndRole(departmentId, Role.EMPLOYEE)
                .stream()
                .filter(User::isActive)
                .collect(Collectors.toList());
        List<UserDto> dtos = employees.stream().map(this::toDto).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDto>> searchUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role) {

        List<User> users;
        if (keyword != null && !keyword.isBlank()) {
            users = userRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCaseOrEmailContainingIgnoreCase(
                    keyword, keyword, keyword);
        } else {
            users = userRepository.findAll();
        }

        // Ne garder que les actifs
        users = users.stream()
                .filter(User::isActive)
                .collect(Collectors.toList());

        if (role != null && !role.isBlank()) {
            users = users.stream()
                    .filter(u -> u.getRole().name().equals(role))
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(users.stream().map(this::toDto).collect(Collectors.toList()));
    }

    @GetMapping("/me/history")
    public ResponseEntity<List<HistoriqueDto>> getMyHistory() {
        User current = userService.getCurrentUser();
        List<Historique> historiques = historiqueRepository.findByUtilisateur(current);
        List<HistoriqueDto> dtos = historiques.stream().map(h -> {
            HistoriqueDto dto = new HistoriqueDto();
            dto.setDateAction(h.getDateAction());
            dto.setAction(h.getAction());
            dto.setCommentaire(h.getCommentaire());
            dto.setDemandeId(h.getDemande().getId());
            dto.setDemandeTitre(h.getDemande().getTitre());
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Long>> getMyStats() {
        User current = userService.getCurrentUser();
        long approved = historiqueRepository.countByUtilisateurAndAction(current, "APPROVE");
        long rejected = historiqueRepository.countByUtilisateurAndAction(current, "REJECT");
        Map<String, Long> stats = new HashMap<>();
        stats.put("approved", approved);
        stats.put("rejected", rejected);
        return ResponseEntity.ok(stats);
    }
}