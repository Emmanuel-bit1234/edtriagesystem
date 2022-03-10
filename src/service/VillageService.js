import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function VillageService() {
    this.getVillage = (id) => {
        var url = `${MICRO_SERVICE_IP}/api/open/village/delimitation/${id}`;
        return axios.get(url).then((response) => response.data);
    };
}
