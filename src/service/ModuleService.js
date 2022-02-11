import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function ModuleService() {
    this.getAllModules = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/modules`;
        return axios.get(url).then((response) => response.data);
      
    };
}
