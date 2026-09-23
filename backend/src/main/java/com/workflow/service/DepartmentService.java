package com.workflow.service;

import com.workflow.entity.Department;
import com.workflow.entity.Role;
import com.workflow.entity.User;
import com.workflow.repository.DepartmentRepository;
import com.workflow.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    public DepartmentService(DepartmentRepository departmentRepository, UserRepository userRepository) {
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Department saveDepartment(Department department, Long chefId, Long secondChefId) {
        // Gestion du chef
        if (chefId != null) {
            User chef = userRepository.findById(chefId)
                    .orElseThrow(() -> new RuntimeException("Chef non trouvé"));
            department.setChef(chef);
            if (chef.getRole() != Role.CHEF_DEPT) {
                chef.setRole(Role.CHEF_DEPT);
                userRepository.save(chef);
            }
        } else {
            department.setChef(null);
        }

        // Gestion du second chef (uniquement pour les départements externes)
        if (!department.isLocal() && secondChefId != null) {
            User secondChef = userRepository.findById(secondChefId)
                    .orElseThrow(() -> new RuntimeException("Second chef non trouvé"));
            department.setSecondChef(secondChef);
        } else {
            department.setSecondChef(null);
        }

        // Nouveau département : actif par défaut
        if (department.getId() == null) {
            department.setActive(true);
        }

        return departmentRepository.save(department);
    }

    @Transactional
    public void deactivateDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        department.setActive(false);
        departmentRepository.save(department);
    }

    @Transactional
    public void removeChefFromDepartment(Long departmentId) {
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Département non trouvé"));
        User oldChef = department.getChef();
        department.setChef(null);
        departmentRepository.save(department);
        if (oldChef != null && !isUserChefOfAnyDepartment(oldChef.getId())) {
            oldChef.setRole(Role.EMPLOYEE);
            userRepository.save(oldChef);
        }
    }

    private boolean isUserChefOfAnyDepartment(Long userId) {
        return departmentRepository.existsByChefId(userId);
    }
}