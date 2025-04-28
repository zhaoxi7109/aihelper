package com.zhaoxi.aihelperbackend.mapper;

import com.zhaoxi.aihelperbackend.entity.MessageImage;
import org.apache.ibatis.annotations.*;

import java.util.List;

@Mapper
public interface MessageImageMapper {
    
    @Insert("INSERT INTO message_images(message_id, original_file_name, oss_key, mime_type, file_size, ocr_text, created_at, updated_at) " +
            "VALUES(#{messageId}, #{originalFileName}, #{ossKey}, #{mimeType}, #{fileSize}, #{ocrText}, #{createdAt}, #{updatedAt})")
    @Options(useGeneratedKeys = true, keyProperty = "id")
    void insert(MessageImage messageImage);
    
    @Select("SELECT * FROM message_images WHERE id = #{id}")
    MessageImage findById(Long id);
    
    @Select("SELECT * FROM message_images WHERE message_id = #{messageId}")
    List<MessageImage> findByMessageId(Long messageId);
    
    @Update("UPDATE message_images SET ocr_text = #{ocrText}, updated_at = #{updatedAt} WHERE id = #{id}")
    void updateOcrText(MessageImage messageImage);
    
    @Delete("DELETE FROM message_images WHERE id = #{id}")
    void deleteById(Long id);
    
    @Delete("DELETE FROM message_images WHERE message_id = #{messageId}")
    void deleteByMessageId(Long messageId);
} 