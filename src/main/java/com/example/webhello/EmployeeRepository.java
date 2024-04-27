package com.example.webhello;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;

interface EmployeeRepository extends JpaRepository<Employee, Long> {
	Collection<Employee> findEmployeeByName(String employee);
}
