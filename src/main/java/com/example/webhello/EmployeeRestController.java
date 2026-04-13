package com.example.webhello;

import java.util.Collection;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import io.opentelemetry.context.Scope;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EmployeeRestController {
    @Autowired
    EmployeeRepository employeeRepository;
    
    private static final Tracer tracer = GlobalOpenTelemetry.getTracer("employee-service");

    @RequestMapping("/employees")
    Collection<Employee> employees() {
        return this.employeeRepository.findAll();
    }

    @GetMapping("/all")
    List<Employee> all() {
        return employeeRepository.findAll();
    }

    @GetMapping("/employees/{id}")
    Employee one(@PathVariable Long id) {

        return employeeRepository.findById(id)
                .orElseThrow(() -> new EmployeeNotFoundException(id));
    }

    @DeleteMapping("/employees/{id}")
    void deleteEmployee(@PathVariable Long id) {
        System.out.println("Deleting id: " + id);
        employeeRepository.deleteById(id);
    }

    @PostMapping("/employees")
    Employee newEmployee(@RequestBody Employee newEmployee) {
        // Layer 1: Validation
        validateEmployee(newEmployee);
        
        try {
            Thread.sleep(2000); // 2-second delay to simulate performance bottleneck
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        return employeeRepository.save(newEmployee);
    }
    
    private void validateEmployee(Employee employee) {
        Span span = tracer.spanBuilder("validateEmployee").startSpan();
        try (Scope scope = span.makeCurrent()) {
            System.out.println("Validating employee: " + employee.getName());
            
            span.setAttribute("employee.name", employee.getName() != null ? employee.getName() : "null");
            span.setAttribute("employee.role", employee.getRole() != null ? employee.getRole() : "null");
            
            if (employee.getName() == null || employee.getName().trim().isEmpty()) {
                span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR, "Employee name is invalid");
                throw new IllegalArgumentException("Employee name cannot be null or empty");
            }
            
            if (employee.getRole() == null || employee.getRole().trim().isEmpty()) {
                span.setStatus(io.opentelemetry.api.trace.StatusCode.ERROR, "Employee role is invalid");
                throw new IllegalArgumentException("Employee role cannot be null or empty");
            }
            
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
            
            System.out.println("Employee validation successful");
        } finally {
            span.end();
        }
    }

    @PutMapping("/employees/{id}")
    Employee replaceEmployee(@RequestBody Employee newEmployee, @PathVariable Long id) {
        return employeeRepository.findById(id)
                .map(employee -> {
                    employee.setName(newEmployee.getName());
                    employee.setRole(newEmployee.getRole());
                    return employeeRepository.save(employee);
                })
                .orElseGet(() -> {
                    newEmployee.setId(id);
                    return employeeRepository.save(newEmployee);
                });
    }

    @GetMapping("/ping")
    String ping() {
        return "pong";
    }
}
