package com.resqlink.api.config;

import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.GeneralSecurityException;
import java.security.Security;
import org.bouncycastle.jce.provider.BouncyCastleProvider;

@Configuration
public class WebPushConfig {

    static {
        // Add BouncyCastle as a security provider, required by web-push library before PushService is created
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
    }

    @Value("${resqlink.security.vapid.public-key}")
    private String publicKey;

    @Value("${resqlink.security.vapid.private-key}")
    private String privateKey;

    @Bean
    public PushService pushService() throws GeneralSecurityException {
        // The PushService constructor expects (publicKey, privateKey, subject)
        return new PushService(publicKey, privateKey, "mailto:support@resqlink.com");
    }
}
