package com.workflow.controller;

import com.workflow.dto.DepartmentDto;
import com.workflow.dto.MessageResponse;
import com.workflow.entity.Department;
import com.workflow.entity.User;
import com.workflow.repository.DepartmentRepository;
import com.workflow.repository.UserRepository;
import com.workflow.service.DepartmentService;
import com.workflow.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.workflow.repository.EtapeValidationRepository;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/departments")
public class DepartmentController {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final EtapeValidationRepository etapeValidationRepository;
    private final DepartmentService departmentService;

    public DepartmentController(DepartmentRepository departmentRepository,
                                UserRepository userRepository,
                                UserService userService,
                                EtapeValidationRepository etapeValidationRepository,
                                DepartmentService departmentService) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.userService = userService;
        this.etapeValidationRepository = etapeValidationRepository;
        this.departmentService = departmentService;
    }

    @GetMapping
    public ResponseEntity<List<DepartmentDto>> getAllDepartments() {
        List<DepartmentDto> dtos = departmentRepository.findAllByActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/grouped")
    public ResponseEntity<Map<String, List<DepartmentDto>>> getDepartmentsGrouped() {
        List<DepartmentDto> locaux = departmentRepository.findByLocalTrueAndActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        List<DepartmentDto> externes = departmentRepository.findByLocalFalseAndActiveTrue().stream()
                .map(this::toDto)
                .collect(Collectors.toList());

        Map<String, List<DepartmentDto>> result = new HashMap<>();
        result.put("locaux", locaux);
        result.put("externes", externes);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DepartmentDto> getDepartment(@PathVariable Long id) {
        Department dept = departmentRepository.findByIdAndActiveTrue(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé ou inactif"));
        return ResponseEntity.ok(toDto(dept));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> createDepartment(@Valid @RequestBody DepartmentDto dto) {
        if (departmentRepository.existsByName(dto.getName())) {
            throw new RuntimeException("Un département avec ce nom existe déjà");
        }
        Department dept = new Department();
        dept.setName(dto.getName());
        dept.setLocal(dto.isLocal());
        Department saved = departmentService.saveDepartment(dept, dto.getChefId(), dto.getSecondChefId());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DepartmentDto> updateDepartment(@PathVariable Long id, @Valid @RequestBody DepartmentDto dto) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        dept.setName(dto.getName());
        dept.setLocal(dto.isLocal());
        Department saved = departmentService.saveDepartment(dept, dto.getChefId(), dto.getSecondChefId());
        return ResponseEntity.ok(toDto(saved));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteDepartment(@PathVariable Long id) {
        departmentService.deactivateDepartment(id);
        return ResponseEntity.ok(new MessageResponse("Département désactivé"));
    }

    private DepartmentDto toDto(Department dept) {
        DepartmentDto dto = new DepartmentDto();
        dto.setId(dept.getId());
        dto.setName(dept.getName());
        dto.setLocal(dept.isLocal());
        if (dept.getChef() != null) {
            dto.setChefId(dept.getChef().getId());
            dto.setChefName(dept.getChef().getFirstName() + " " + dept.getChef().getLastName());
        }
        if (dept.getSecondChef() != null) {
            dto.setSecondChefId(dept.getSecondChef().getId());
            dto.setSecondChefName(dept.getSecondChef().getFirstName() + " " + dept.getSecondChef().getLastName());
        }
        return dto;
    }
}