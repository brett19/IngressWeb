package com.brett;

import org.eclipse.jetty.server.Handler;
import org.eclipse.jetty.server.Server;
import org.eclipse.jetty.server.handler.ContextHandler;
import org.eclipse.jetty.server.handler.DefaultHandler;
import org.eclipse.jetty.server.handler.HandlerList;
import org.eclipse.jetty.server.handler.ResourceHandler;

public class IngressWeb {
	
	public static void main(String[] args) throws Exception
	{
	    Server server = new Server(4040);

	    ContextHandler contextx = new ContextHandler();
	    contextx.setContextPath("/api/proxy");
	    contextx.setResourceBase(".");
	    contextx.setClassLoader(Thread.currentThread().getContextClassLoader());
	    contextx.setHandler(new ProxyHandler());

	    ContextHandler contexty = new ContextHandler();
	    contexty.setContextPath("/api/cellid");
	    contexty.setResourceBase(".");
	    contexty.setClassLoader(Thread.currentThread().getContextClassLoader());
	    contexty.setHandler(new CellIdHandler());
	    
	    ContextHandler contextz = new ContextHandler();
	    contextz.setContextPath("/api/cellnear");
	    contextz.setResourceBase(".");
	    contextz.setClassLoader(Thread.currentThread().getContextClassLoader());
	    contextz.setHandler(new CellNearHandler());
	   
	    ContextHandler contextv = new ContextHandler();
	    contextv.setContextPath("/api/celllatlng");
	    contextv.setResourceBase(".");
	    contextv.setClassLoader(Thread.currentThread().getContextClassLoader());
	    contextv.setHandler(new CellLatLngHandler());
	    
	    ResourceHandler resource_handler = new ResourceHandler();
        resource_handler.setDirectoriesListed(true);
        resource_handler.setResourceBase("public");
        resource_handler.setCacheControl("no-cache");
	    
        HandlerList contexts = new HandlerList();
        contexts.setHandlers(new Handler[] { resource_handler, contextx, contexty, contextz, contextv, new DefaultHandler() });
        server.setHandler(contexts);
	    
	    server.start();
	    server.join();
	    
	}

}
