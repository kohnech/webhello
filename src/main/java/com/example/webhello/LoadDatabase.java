package com.example.webhello;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
//import org.springframework.boot.CommandLineRunner;
//import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
class LoadDatabase {

  private static final Logger log = LoggerFactory.getLogger(LoadDatabase.class);

  /*
  @Bean
  CommandLineRunner initDatabase(EmployeeRepository repository) {

    return args -> {
      log.info("Preloading " + repository.save(new Employee("Bilbo Baggins", "CEO")));
      log.info("Preloading " + repository.save(new Employee("Frodo Baggins", "CFO")));
      log.info("Preloading " + repository.save(new Employee("Lars Thylen", "CTO")));
    };
  } */
}
