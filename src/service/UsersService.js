import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function UsersService() {
    this.getAllUsers = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysuser`;
        return axios.get(url).then((response) => response.data);
    };
    this.createUser = (data) => {
        var url = `${MICRO_SERVICE_IP}/api/auth/signup`;
        return axios.post(url, data).then((response) => response.data);
    };
}
