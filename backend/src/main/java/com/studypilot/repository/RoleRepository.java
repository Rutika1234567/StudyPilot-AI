package com.studypilot.repository;

import com.studypilot.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    // Spring Data JPA auto-generates the SQL: SELECT * FROM roles WHERE name = ?
    Optional<Role> findByName(String name);
}