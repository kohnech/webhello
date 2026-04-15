package com.example.webhello;

import java.util.Collection;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

interface EmployeeRepository extends JpaRepository<Employee, Long> {
	Collection<Employee> findEmployeeByName(String employee);
	
	@Query("SELECT COUNT(e) FROM Employee e")
	long countAllEmployees();
}
