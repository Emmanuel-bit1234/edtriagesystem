import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config"

export default function RegistrationCentreService() {

    this.getRegistrationCentres = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/regCentre`
        return axios.get(url).then(response => response.data)
    }
    this.getRegistrationCentreById = (id) => { }
}
