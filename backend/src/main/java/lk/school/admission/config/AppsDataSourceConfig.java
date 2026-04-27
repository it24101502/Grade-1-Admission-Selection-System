package lk.school.admission.config;

import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManagerFactory;
import lk.school.admission.entity.Application;

/**
 * Secondary DataSource → admission_apps database.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  admission_apps  contains ONE table only:               │
 * │    applications  — submitted application forms          │
 * └─────────────────────────────────────────────────────────┘
 *
 * Instead of scanning a package, we pass the Application class
 * directly so ONLY that table is created in this database.
 * All other entities go to admission_system.
 */
@Configuration
@EnableJpaRepositories(
    basePackages            = "lk.school.admission.repository.apps",
    entityManagerFactoryRef = "appsEntityManagerFactory",
    transactionManagerRef   = "appsTransactionManager"
)
public class AppsDataSourceConfig {

    @Bean("appsDataSourceProperties")
    @ConfigurationProperties("spring.datasource.apps")
    public DataSourceProperties appsDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Bean("appsDataSource")
    public DataSource appsDataSource(
            @Qualifier("appsDataSourceProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }

    @Bean("appsEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean appsEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("appsDataSource") DataSource ds) {
        return builder
            .dataSource(ds)
            // Only the Application entity belongs in admission_apps.
            // We point to a dedicated sub-package that contains only Application.
            // No sub-packages needed — we pass the class directly via managedTypes below.
            .packages(Application.class)
            .persistenceUnit("apps")
            .properties(Map.of(
                "hibernate.hbm2ddl.auto", "update",
                "hibernate.dialect",      "org.hibernate.dialect.MySQLDialect",
                "hibernate.show_sql",     "false",
                "hibernate.format_sql",   "false"
            ))
            .build();
    }

    @Bean("appsTransactionManager")
    public PlatformTransactionManager appsTransactionManager(
            @Qualifier("appsEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}