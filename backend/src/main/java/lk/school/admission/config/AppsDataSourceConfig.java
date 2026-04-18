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
 * Secondary DataSource → admission_apps database.
 * Stores: Parent, Application (form data only, written by parents).
 * Repositories live in: lk.school.admission.repository.apps
 */
@Configuration
@EnableJpaRepositories(
    basePackages           = "lk.school.admission.repository.apps",
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
            .packages("lk.school.admission.entity")
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