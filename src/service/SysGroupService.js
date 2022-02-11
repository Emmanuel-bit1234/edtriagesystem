import axios from "axios";
import { MICRO_SERVICE_IP } from "../config/Config";

export default function SysGroupService() {
    this.getAllSysGroup = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup`;
        return axios.get(url).then((response) => response.data);
    };
    this.getSysGroupById = (id) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup/` + id;
        return axios.get(url).then((response) => response.data);
    };

    this.updateSysGroup = (data) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup`;
        return axios.put(url).then((response) => response.data);
    };

    this.createSysGroup = (data) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup`;
        console.log("data sent to server --->");
        console.log(data);
        return axios.post(url, data).then((response) => response.data);
    };

    this.removeSysGroup = (id) => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup/` + id;
        return axios.delete(url).then((response) => response.data);
    };
}
