import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function GenderService() {
    this.getAllGender = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/gender`;
        return axios.get(url).then((response) => response.data);
    };
}
