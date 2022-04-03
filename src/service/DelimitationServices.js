import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function DelimitationServices() {
    this.getAllDistrict = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/delimitation/national/district`;
        return axios.get(url).then((response) => response.data);
    };
}
