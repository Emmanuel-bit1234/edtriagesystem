import axios from "axios"
import { MICRO_SERVICE_IP } from "../config/Config"

export default function SysGroupService() {
    this.getSysAllGroup = () => {
        var url = `${MICRO_SERVICE_IP}/api/open/sysgroup`
        return axios.get(url).then(response => response.data)
    }
    this.getSysGroupById = (id) => { }
    this.createSysGroup = (data) => { }
    this.updateSysGroup = (data) => { }
}
