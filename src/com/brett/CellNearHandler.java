package com.brett;

import java.io.IOException;
import java.util.ArrayList;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.geometry.S2CellId;

public class CellNearHandler extends AbstractHandler {
    public void handle(String target,Request baseRequest,HttpServletRequest request,HttpServletResponse response) 
    		throws IOException, ServletException
    {
        response.setStatus(HttpServletResponse.SC_OK);
        baseRequest.setHandled(true);

        Long cellId = Long.parseLong(request.getParameter("cellid"),16);
		S2CellId foundCell = new S2CellId(cellId);
		
		ArrayList<S2CellId> neighbourList = new ArrayList<S2CellId>( );
		foundCell.getAllNeighbors(16, neighbourList);
		
		ArrayList<String> neighbourIdList = new ArrayList<String>( );
		for( int i = 0; i < neighbourList.size(); ++i ) {
			neighbourIdList.add( Long.toString(neighbourList.get(i).id(),16) );
		}
		
        ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		mapper.writeValue(response.getWriter(), neighbourIdList );
    }
}
