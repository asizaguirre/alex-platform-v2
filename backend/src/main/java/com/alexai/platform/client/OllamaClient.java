package com.alexai.platform.client;


import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;


@Component
public class OllamaClient {


    private final RestTemplate restTemplate =
            new RestTemplate();


    @Value("${ollama.url}")
    private String ollamaUrl;


    @Value("${ollama.model}")
    private String model;



    public String generate(
            String prompt
    ){


        String url =
                ollamaUrl + "/api/generate";


        Map<String,Object> body =
                Map.of(
                    "model",
                    model,

                    "prompt",
                    prompt,

                    "stream",
                    false
                );


        Map response =
                restTemplate.postForObject(
                        url,
                        body,
                        Map.class
                );


        return response
                .get("response")
                .toString();

    }

}
