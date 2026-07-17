package com.alexai.platform.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Endpoint de shutdown da plataforma.
 * Apenas administradores autenticados (verificados por e-mail) podem desligar.
 */
@RestController
@RequestMapping("/api")
@CrossOrigin
public class ShutdownController {

    @Autowired
    private ApplicationContext context;

    /**
     * Lista de e-mails de administradores autorizados.
     * Configurável via variável de ambiente ADMIN_EMAILS (separados por vírgula).
     * Padrão: o e-mail do dono da plataforma.
     */
    private String[] getAdminEmails() {
        String emails = System.getenv().getOrDefault("ADMIN_EMAILS", "");
        if (emails.isEmpty()) {
            return new String[0];
        }
        return emails.split(",");
    }

    /**
     * Verifica se um e-mail é admin.
     */
    private boolean isAdmin(String email) {
        if (email == null || email.isBlank()) return false;
        String[] admins = getAdminEmails();

        // Se nenhum admin configurado, não permitir shutdown via web
        if (admins.length == 0) return false;

        for (String admin : admins) {
            if (admin.trim().equalsIgnoreCase(email.trim())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verifica se o e-mail informado é administrador.
     * Usado pelo frontend para mostrar/esconder o botão de shutdown.
     */
    @PostMapping("/admin/verify")
    public Map<String, Object> verifyAdmin(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");
        boolean authorized = isAdmin(email);
        return Map.of(
                "authorized", authorized,
                "email", email
        );
    }

    /**
     * Desliga a plataforma (graceful shutdown do Spring Boot).
     * Requer que o body contenha um e-mail de administrador válido.
     */
    @PostMapping("/admin/shutdown")
    public Map<String, String> shutdown(@RequestBody Map<String, String> body) {
        String email = body.getOrDefault("email", "");

        if (!isAdmin(email)) {
            return Map.of(
                    "status", "DENIED",
                    "message", "Você não tem permissão para desligar a plataforma."
            );
        }

        // Schedule shutdown after response is sent
        new Thread(() -> {
            try {
                Thread.sleep(1500); // Wait 1.5s for response to be sent
            } catch (InterruptedException ignored) {
            }
            System.out.println("=== SHUTDOWN INICIADO POR ADMIN: " + email + " ===");
            SpringApplication.exit(context, () -> 0);
        }).start();

        return Map.of(
                "status", "SHUTTING_DOWN",
                "message", "AlEx Platform v2 está sendo desligada por " + email + "... Até breve!"
        );
    }
}
