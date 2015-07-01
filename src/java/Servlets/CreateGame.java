/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package Servlets;

import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import ws.roulette.DuplicateGameName_Exception;
import ws.roulette.InvalidParameters_Exception;
import static ws.roulette.RouletteType.AMERICAN;
import static ws.roulette.RouletteType.FRENCH;
import ws.roulette.RouletteWebService;

/**
 *
 * @author Yuval Segall
 */
@WebServlet(name = "CreateGame", urlPatterns = {"/CreateGame"})
public class CreateGame extends HttpServlet {

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
            return;
        }
        if (Utils.isIntergerParamsOk(request, "computerPlayers")) {
            response.setStatus(400);
            response.setHeader("exception", "Bad Request");
            return;
        }
        try {
            server.createGame(Integer.valueOf(request.getParameter("computerPlayers")), Integer.valueOf(request.getParameter("humanPlayers")), Integer.valueOf(request.getParameter("initalSumOfMoney")), Integer.valueOf(request.getParameter("maxWages")), Integer.valueOf(request.getParameter("minWages")), request.getParameter("gameName"), request.getParameter("rouletteType").equals("AMERICAN") ? AMERICAN : FRENCH);
            response.setStatus(201);
        } catch (DuplicateGameName_Exception ex) {
            response.setStatus(409);
            response.setHeader("exception", ex.getMessage());
        } catch (InvalidParameters_Exception ex) {
            response.setStatus(400);
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
