import { store } from "@/store";
import apiClient from "../core/ApiClient";
import { RESPONSE_STATUS_OK } from "../Constant";
import { setOA } from "@/store/reducers/oa";
import { setOrgs } from "@/store/reducers/orgs";

class OrgDataFactory {
  constructor(clientData) {
    this.orgId = clientData.orgId;
    this.loading = clientData.loading;
    this.setLoading = clientData.setLoading;
  }

  /**
   * query org data from backend
   * @returns {Promise<void>}
   */
  async queryOrgData() {
    this.setLoading(true);

    const orgsResponse = await apiClient.get(`/users/orgs`);
    if (orgsResponse.code === RESPONSE_STATUS_OK) {
      store.dispatch(setOrgs(orgsResponse.data));
    } else {
      throw new Error(oaResponse.message);
    }

    const oaResponse = await apiClient.get(`/oas/get-by-org?orgId=${this.orgId}`);
    if (oaResponse.code === RESPONSE_STATUS_OK) {
      store.dispatch(setOA(oaResponse.data.oa));
    } else {
      throw new Error(oaResponse.message);
    }

    this.setLoading(false);
  }
}

export default OrgDataFactory;
