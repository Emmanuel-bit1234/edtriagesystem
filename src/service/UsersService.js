import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function UsersService() {
    this.getAllUsers = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysuser/full`;
        return axios.get(url).then((response) => response.data);
    };
    this.deActivateUser = (id) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysuser/de-activate/${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.activateUser = (id) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysuser/activate/${id}`;
        return axios.get(url).then((response) => response.data);
    };
    this.createUser = (data) => {
        var url = `${MICRO_SERVICE_IP}/api/auth/signup`;
        return axios.post(url, data).then((response) => response.data);
    };
}
