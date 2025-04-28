package com.zhaoxi.aihelperbackend.config;

import org.apache.ibatis.session.SqlSessionFactory;
import org.mybatis.spring.SqlSessionFactoryBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.Date;
import org.apache.ibatis.type.BaseTypeHandler;
import org.apache.ibatis.type.JdbcType;
import org.apache.ibatis.type.MappedTypes;
import org.apache.ibatis.type.TypeHandlerRegistry;

import java.sql.CallableStatement;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;

/**
 * MyBatis配置类
 * 
 * 用于配置MyBatis的相关设置，如类型转换器、插件等
 * 
 * @author zhaoxi
 * @since 1.0.0
 */
@Configuration
public class MyBatisConfig {
    
    /**
     * 配置SqlSessionFactory
     * 
     * @param dataSource 数据源
     * @return SqlSessionFactory实例
     * @throws Exception 如果配置失败
     */
    @Bean
    public SqlSessionFactory sqlSessionFactory(DataSource dataSource) throws Exception {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        factoryBean.setMapperLocations(new PathMatchingResourcePatternResolver().getResources("classpath:mapper/*.xml"));
        
        // 设置类型处理器所在的包
        factoryBean.setTypeHandlers(new BaseTypeHandler[] {
            new LocalDateTimeTypeHandler()
        });
        
        return factoryBean.getObject();
    }
    
    /**
     * LocalDateTime类型处理器
     * 
     * 负责在Java的LocalDateTime和数据库的TIMESTAMP类型之间进行转换
     */
    @MappedTypes(LocalDateTime.class)
    public static class LocalDateTimeTypeHandler extends BaseTypeHandler<LocalDateTime> {
        
        @Override
        public void setNonNullParameter(PreparedStatement ps, int i, LocalDateTime parameter, JdbcType jdbcType) throws SQLException {
            ps.setTimestamp(i, Timestamp.valueOf(parameter));
        }
        
        @Override
        public LocalDateTime getNullableResult(ResultSet rs, String columnName) throws SQLException {
            Timestamp timestamp = rs.getTimestamp(columnName);
            return getLocalDateTime(timestamp);
        }
        
        @Override
        public LocalDateTime getNullableResult(ResultSet rs, int columnIndex) throws SQLException {
            Timestamp timestamp = rs.getTimestamp(columnIndex);
            return getLocalDateTime(timestamp);
        }
        
        @Override
        public LocalDateTime getNullableResult(CallableStatement cs, int columnIndex) throws SQLException {
            Timestamp timestamp = cs.getTimestamp(columnIndex);
            return getLocalDateTime(timestamp);
        }
        
        private LocalDateTime getLocalDateTime(Timestamp timestamp) {
            if (timestamp != null) {
                return timestamp.toLocalDateTime();
            }
            return null;
        }
    }
} 