package com.dimitar.eventora.email;

import java.util.Arrays;

//Represents a simple email attachment backed by in-memory bytes.
public record EmailAttachment(String fileName, byte[] content, String contentType) {
    public EmailAttachment {
        if (fileName == null || fileName.isBlank()) {
            throw new IllegalArgumentException("Attachment file name must not be blank");
        }
        if (content == null || content.length == 0) {
            throw new IllegalArgumentException("Attachment content must not be empty");
        }
        if (contentType == null || contentType.isBlank()) {
            throw new IllegalArgumentException("Attachment content type must not be blank");
        }
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (!(obj instanceof EmailAttachment)) {
            return false;
        }
        EmailAttachment other = (EmailAttachment) obj;
        return fileName.equals(other.fileName)
                && contentType.equals(other.contentType)
                && Arrays.equals(content, other.content);
    }

    @Override
    public int hashCode() {
        int result = fileName.hashCode();
        result = 31 * result + contentType.hashCode();
        result = 31 * result + Arrays.hashCode(content);
        return result;
    }

    @Override
    public String toString() {
        return "EmailAttachment{" +
                "fileName='" + fileName + '\'' +
                ", contentType='" + contentType + '\'' +
                ", contentLength=" + content.length +   
                '}';
    }
}
