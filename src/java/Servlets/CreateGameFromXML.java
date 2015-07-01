/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import com.google.gson.Gson;
import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ws.roulette.DuplicateGameName_Exception;
import ws.roulette.InvalidParameters_Exception;
import ws.roulette.InvalidXML_Exception;
import ws.roulette.RouletteWebService;

/**
 *
 * @author Yuval Segall
 */
@WebServlet(name = "CreateGameFromXML", urlPatterns = {"/CreateGameFromXML"})
public class CreateGameFromXML extends HttpServlet {

    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) {
        RouletteWebService server = (RouletteWebService) getServletContext().getAttribute("gameWebService");
        if (server == null) {
            response.setStatus(503);
            response.setHeader("exception", "Service Unavailable");
        } else {
            try {
                String gameName = server.createGameFromXML(request.getParameter("xmlData"));
                Gson gson = new Gson();
                response.setStatus(201);
                response.setContentType("application/json");
                try (PrintWriter out = response.getWriter()) {
                    out.println(gson.toJson(gameName));
                }
            } catch (DuplicateGameName_Exception ex) {
                response.setStatus(409);
                response.setHeader("exception", ex.getMessage());
            } catch (InvalidParameters_Exception ex) {
                response.setStatus(400);
                response.setHeader("exception", ex.getMessage());
            } catch (InvalidXML_Exception ex) {
                response.setStatus(415);
                response.setHeader("exception", ex.getMessage());
            } catch (Exception ex) {
                response.setStatus(500);
                response.setHeader("exception", ex.getMessage());
            }
        }
    }

    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        processRequest(request, response);
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

}
