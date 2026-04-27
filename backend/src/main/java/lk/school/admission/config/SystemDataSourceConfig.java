package lk.school.admission.config;

import java.util.Map;

import javax.sql.DataSource;

import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.orm.jpa.EntityManagerFactoryBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.transaction.PlatformTransactionManager;

import jakarta.persistence.EntityManagerFactory;
import lk.school.admission.entity.MarkingCriterion;
import lk.school.admission.entity.MarkingScheme;
import lk.school.admission.entity.Parent;
import lk.school.admission.entity.ParentApplication;
import lk.school.admission.entity.ParentChild;
import lk.school.admission.entity.SystemUser;
import lk.school.admission.entity.User;

/**
 * Primary DataSource → admission_system database.
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  admission_system  contains ALL tables except           │
 * │  the applications table (which is in admission_apps).   │
 * │                                                         │
 * │  Tables:                                                │
 * │    system_users          Admin, Document Controller     │
 * │    users                 Marking users (one per cat.)   │
 * │    parents               Parent login accounts          │
 * │    parent_children       Children under each parent     │
 * │    parent_applications   Category slots per child       │
 * │    marking_schemes       DC-designed marking templates  │
 * │    marking_criteria      Criteria within each scheme    │
 * └─────────────────────────────────────────────────────────┘
 *
 * We pass each entity class directly so there is no ambiguity
 * about which database a table belongs to. No sub-packages needed.
 * All entity files stay in lk.school.admission.entity as before.
 */
@Configuration
@EnableJpaRepositories(
    basePackages            = "lk.school.admission.repository.system",
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
            // Every entity EXCEPT Application belongs in admission_system.
            // Listed explicitly — no sub-packages, all stay in entity package.
            .packages(
                SystemUser.class,
                User.class,
                Parent.class,
                ParentChild.class,
                ParentApplication.class,
                MarkingScheme.class,
                MarkingCriterion.class
            )
            .persistenceUnit("system")
            .properties(Map.of(
                "hibernate.hbm2ddl.auto", "update",
                "hibernate.dialect",      "org.hibernate.dialect.MySQLDialect",
                "hibernate.show_sql",     "false",
                "hibernate.format_sql",   "false"
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