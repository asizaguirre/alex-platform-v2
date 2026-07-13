package com.alexai.platform.service;


import com.alexai.platform.client.OllamaClient;
import com.alexai.platform.dto.ChatRequest;
import com.alexai.platform.dto.ChatResponse;

import org.springframework.stereotype.Service;


@Service
public class AgentService {


    private final OllamaClient ollamaClient;


    public AgentService(
            OllamaClient ollamaClient
    ){

        this.ollamaClient = ollamaClient;

    }



    public ChatResponse execute(
            ChatRequest request
    ){


        String agent =
                request.getAgent();


        if(agent == null ||
           agent.isBlank()){

            agent = "alex";

        }



        String systemPrompt;



        if(agent.equalsIgnoreCase("alia")){


            systemPrompt = """
                    Você é Alia.
                    
                    Especialista em conhecimento,
                    RAG, organização de informações
                    e análise documental.
                    """;


        }else{


            systemPrompt = """
                    Você é AlEx.
                    
                    Arquiteto de Soluções especialista
                    em Java, Cloud, arquitetura de software
                    e sistemas distribuídos.
                    """;

        }



        String prompt =
                systemPrompt
                + "\n\nUsuário:\n"
                + request.getMessage();



        String response =
                ollamaClient.generate(prompt);



        return new ChatResponse(
                agent,
                response
        );

    }

}
