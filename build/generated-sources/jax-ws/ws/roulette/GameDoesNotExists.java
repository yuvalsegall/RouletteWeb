
package ws.roulette;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for GameDoesNotExists complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType name="GameDoesNotExists">
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element name="faultInfo" type="{http://roulette.ws/}rouletteFault" minOccurs="0"/>
 *         &lt;element name="message" type="{http://www.w3.org/2001/XMLSchema}string" minOccurs="0"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "GameDoesNotExists", propOrder = {
    "faultInfo",
    "message"
})
public class GameDoesNotExists {

    protected RouletteFault faultInfo;
    protected String message;

    /**
     * Gets the value of the faultInfo property.
     * 
     * @return
     *     possible object is
     *     {@link RouletteFault }
     *     
     */
    public RouletteFault getFaultInfo() {
        return faultInfo;
    }

    /**
     * Sets the value of the faultInfo property.
     * 
     * @param value
     *     allowed object is
     *     {@link RouletteFault }
     *     
     */
    public void setFaultInfo(RouletteFault value) {
        this.faultInfo = value;
    }

    /**
     * Gets the value of the message property.
     * 
     * @return
     *     possible object is
     *     {@link String }
     *     
     */
    public String getMessage() {
        return message;
    }

    /**
     * Sets the value of the message property.
     * 
     * @param value
     *     allowed object is
     *     {@link String }
     *     
     */
    public void setMessage(String value) {
        this.message = value;
    }

}
