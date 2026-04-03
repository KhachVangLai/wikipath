package com.hungbm.wikipath;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class WikipathApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(WikipathApiApplication.class, args);
	}

}
