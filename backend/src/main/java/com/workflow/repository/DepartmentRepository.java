package com.workflow.repository;

import com.workflow.entity.Department;
import com.workflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Long> {
    Optional<Department> findByName(String name);
    boolean existsByName(String name);
    List<Department> findByChef(User chef);
    
    // Filtrer par type (local ou externe) - existants
    List<Department> findByLocalTrue();   // départements internes
    List<Department> findByLocalFalse();  // départements externes
    boolean existsByChefId(Long userId);

    // ✅ Soft delete : départements actifs uniquement
    List<Department> findAllByActiveTrue();
    Optional<Department> findByIdAndActiveTrue(Long id);
    List<Department> findByLocalTrueAndActiveTrue();
    List<Department> findByLocalFalseAndActiveTrue();
}