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
     * @throws java.io.IOException
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response) throws IOException {
        Utils utils = new Utils();
        RouletteWebService server = utils.gerServer(response);
        if (server == null) {
            return;
        }
        if (!Utils.isParamsOk(request, response, String.class, "xmlData")) {
            return;
        }
        try {
            String gameName = server.createGameFromXML(request.getParameter("xmlData"));
            response.setStatus(201);
            response.setContentType("application/json");
            Gson gson = new Gson();
            try (PrintWriter out = response.getWriter()) {
                out.println(gson.toJson(gameName));
            }
        } catch (DuplicateGameName_Exception ex) {
            response.setStatus(409);
            response.setHeader("exception", ex.getMessage());
        } catch (InvalidParameters_Exception ex) {
            response.setStatus(406);
            response.setHeader("exception", ex.getMessage());
        } catch (InvalidXML_Exception ex) {
            response.setStatus(415);
            response.setHeader("exception", ex.getMessage());
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
