import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function StaffService() {
    this.getStaffType = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/staffType`;
        return axios.get(url).then(response => response.data)
    }

    this.getStaffPosition = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/staffPosition`;
        return axios.get(url).then(response => response.data)
    }
}
