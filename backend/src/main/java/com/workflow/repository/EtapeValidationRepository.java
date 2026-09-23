package com.workflow.repository;

import com.workflow.entity.EtapeValidation;
import com.workflow.entity.Workflow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EtapeValidationRepository extends JpaRepository<EtapeValidation, Long> {
    List<EtapeValidation> findByWorkflowOrderByOrdreAsc(Workflow workflow);
    
    @Query("SELECT COUNT(e) FROM EtapeValidation e WHERE e.department.id = :departmentId")
    long countByDepartmentId(@Param("departmentId") Long departmentId);
}