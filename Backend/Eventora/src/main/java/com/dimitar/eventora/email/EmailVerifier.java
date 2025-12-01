package com.dimitar.eventora.email;

import jakarta.mail.internet.AddressException;
import jakarta.mail.internet.InternetAddress;
import java.util.Hashtable;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.directory.Attribute;
import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import org.springframework.stereotype.Component;

@Component
public class EmailVerifier {

    private static final String DNS_FACTORY = "com.sun.jndi.dns.DnsContextFactory";

    public void verifyDeliverability(String email) {
        String normalized = normalize(email);
        validateSyntax(normalized);
        if (!hasMxRecord(extractDomain(normalized))) {
            throw new IllegalArgumentException("Email domain must accept mail");
        }
    }

    private void validateSyntax(String email) {
        try {
            InternetAddress address = new InternetAddress(email, true);
            address.validate();
        } catch (AddressException ex) {
            throw new IllegalArgumentException("Invalid email address", ex);
        }
    }

    @SuppressWarnings({"UseOfObsoleteCollectionType", "java:S1149"})
    private boolean hasMxRecord(String domain) {
        DirContext context = null;
        NamingEnumeration<?> enumeration = null;
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", DNS_FACTORY);
            context = new InitialDirContext(env);
            Attributes attrs = context.getAttributes(domain, new String[]{"MX"});
            Attribute attr = attrs.get("MX");
            if (attr == null || attr.size() == 0) {
                return false;
            }
            enumeration = attr.getAll();
            while (enumeration.hasMore()) {
                Object value = enumeration.next();
                if (isDeliverableMxTarget(value)) {
                    return true;
                }
            }
            return false;
        } catch (NamingException ex) {
            return false;
        } finally {
            if (enumeration != null) {
                try {
                    enumeration.close();
                } catch (NamingException ignored) {
                }
            }
            if (context != null) {
                try {
                    context.close();
                } catch (NamingException ignored) {
                }
            }
        }
    }

    private boolean isDeliverableMxTarget(Object recordValue) {
        if (recordValue == null) {
            return false;
        }
        String recordText = recordValue.toString().trim();
        if (recordText.isEmpty()) {
            return false;
        }
        String[] parts = recordText.split("\\s+");
        if (parts.length == 0) {
            return false;
        }
        String target = parts[parts.length - 1];
        if (target.endsWith(".")) {
            target = target.substring(0, target.length() - 1);
        }
        return !target.isBlank();
    }

    private String extractDomain(String email) {
        int atIndex = email.lastIndexOf('@');
        if (atIndex < 0 || atIndex == email.length() - 1) {
            throw new IllegalArgumentException("Email must contain a domain");
        }
        return email.substring(atIndex + 1);
    }

    private String normalize(String email) {
        if (email == null) {
            throw new IllegalArgumentException("Email address is required");
        }
        return email.trim();
    }
}
