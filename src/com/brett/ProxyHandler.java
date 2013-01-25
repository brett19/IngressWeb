package com.brett;

import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.zip.GZIPInputStream;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.http.Header;
import org.apache.http.HttpRequest;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.cookie.Cookie;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.DefaultHttpClient;
import org.apache.http.impl.cookie.BasicClientCookie;
import org.eclipse.jetty.server.Request;
import org.eclipse.jetty.server.handler.AbstractHandler;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;

public class ProxyHandler extends AbstractHandler
{
    public void handle(String target,Request baseRequest,HttpServletRequest request,HttpServletResponse response) 
        throws IOException, ServletException
    {
        response.setContentType("application/json;charset=utf-8");
        response.setStatus(HttpServletResponse.SC_OK);
        baseRequest.setHandled(true);

        ObjectMapper mapper = new ObjectMapper();
		mapper.configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
		
		ProxyRequest req = mapper.readValue(request.getReader(), ProxyRequest.class);
		
		DefaultHttpClient client = new DefaultHttpClient();
		
		
		Calendar calendar = Calendar.getInstance();
		calendar.add(Calendar.DAY_OF_YEAR, 1);
		Date cookieExpiry = calendar.getTime();
		
		
		BasicCookieStore cookieStore = new BasicCookieStore();
		for( String cookieName : req.cookies.keySet() ) {
			System.out.println(cookieName + " : " + req.cookies.get(cookieName));
			BasicClientCookie cookie = new BasicClientCookie(cookieName, req.cookies.get(cookieName));
			cookie.setDomain("betaspike.appspot.com");
			cookie.setPath("/");
			cookie.setExpiryDate(cookieExpiry);
			cookieStore.addCookie(cookie);
		}
		client.setCookieStore(cookieStore);
		
		
		
		HttpUriRequest loginReq = null;

		if( req.method.equals("POST") ) {
			HttpPost loginReqP = new HttpPost(req.url);
			loginReqP.setEntity(new StringEntity(req.body));
			loginReq = loginReqP;
		} else if( req.method.equals("GET") ){
			loginReq = new HttpGet(req.url);
		}
	    
		System.out.println( "XsrfToken: " + req.xsrfToken );
		if( req.xsrfToken != null ) {
			loginReq.setHeader( "X-XsrfToken", req.xsrfToken );
		}

	    loginReq.setHeader("Accept-Encoding", "gzip");
	    loginReq.setHeader("User-Agent", "Nemesis (gzip)");
	    
	    if( req.contentType != null ) {
	    	loginReq.setHeader( "Content-Type", req.contentType );
	    }
	    
		HttpResponse respx = client.execute(loginReq);
		
		Header[] lheaders = loginReq.getAllHeaders( );
		for( int i = 0; i < lheaders.length; ++i ) {
			System.out.println(lheaders[i].getName() + ": " + lheaders[i].getValue());
		}

		
		InputStream inStream = null;
		if( respx.getEntity().getContentEncoding() != null ) {
			if( respx.getEntity().getContentEncoding().getValue().equals("gzip") ) {
				inStream = new GZIPInputStream(respx.getEntity().getContent());
			} else {
				System.out.println( "Unknown Encoding!" );
			}
		} else {
			inStream = respx.getEntity().getContent();
		}
		
		ProxyResponse resp = new ProxyResponse( );
		resp.body = CharStreams.toString(new InputStreamReader(inStream, Charsets.UTF_8));
		
		
		
		List<Cookie> cookies = cookieStore.getCookies();
		for( int i = 0; i < cookies.size(); ++i ) {
			resp.cookies.put(cookies.get(i).getName(), cookies.get(i).getValue());
			System.out.println(cookies.get(i).toString());
		}
		
		resp.statusCode = respx.getStatusLine().getStatusCode();
		
		mapper.writeValue(response.getWriter(), resp);

    }
}