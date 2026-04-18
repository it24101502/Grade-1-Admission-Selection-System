package lk.school.admission.config;

import jakarta.persistence.EntityManagerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.*;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import javax.sql.DataSource;
import java.util.Map;

/**
 * Primary DataSource → admission_system database.
 * Stores: SystemUser, User, MarkingScheme, MarkingCriterion, JudgeScore, ApplicationFlag.
 * Repositories live in: lk.school.admission.repository.system
 */
@Configuration
@EnableJpaRepositories(
    basePackages           = "lk.school.admission.repository.system",
    entityManagerFactoryRef = "systemEntityManagerFactory",
    transactionManagerRef   = "systemTransactionManager"
)
public class SystemDataSourceConfig {

    @Primary
    @Bean("systemDataSourceProperties")
    @ConfigurationProperties("spring.datasource.system")
    public DataSourceProperties systemDataSourceProperties() {
        return new DataSourceProperties();
    }

    @Primary
    @Bean("systemDataSource")
    public DataSource systemDataSource(
            @Qualifier("systemDataSourceProperties") DataSourceProperties props) {
        return props.initializeDataSourceBuilder().build();
    }

    @Primary
    @Bean("systemEntityManagerFactory")
    public LocalContainerEntityManagerFactoryBean systemEntityManagerFactory(
            EntityManagerFactoryBuilder builder,
            @Qualifier("systemDataSource") DataSource ds) {
        return builder
            .dataSource(ds)
            .packages("lk.school.admission.entity")
            .persistenceUnit("system")
            .properties(Map.of(
                // update  → creates/alters tables on startup, never drops data
                // create  → drops and recreates on every startup (dev only)
                // validate→ checks schema matches entities, no changes made
                "hibernate.hbm2ddl.auto",          "update",
                "hibernate.dialect",               "org.hibernate.dialect.MySQLDialect",
                "hibernate.show_sql",              "false",
                "hibernate.format_sql",            "false"
            ))
            .build();
    }

    @Primary
    @Bean("systemTransactionManager")
    public PlatformTransactionManager systemTransactionManager(
            @Qualifier("systemEntityManagerFactory") EntityManagerFactory emf) {
        return new JpaTransactionManager(emf);
    }
}