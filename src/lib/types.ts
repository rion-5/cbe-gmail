// src/lib/types.ts
export interface Recipient {
  name: string;
  email: string;
}

export interface LoginParam {
    loginId: string;
    password: string;
}

export interface PyxisLoginData {
    success: boolean;
    code: string;
    message: string;
    data: {
        availableHomepages: number[];
        isPrivacyPolicyAgree: boolean;
        privacyPolicyAgreePeriod: number;
        dept: {
            id: number;
            code: string;
            name: string;
        };
        mobileSiteMobilePatronNo: string;
        accessToken: string;
        parentDept: {
            id: number;
            code: string;
            name: string;
        };
        branch: {
            id: number;
            name: string;
            alias: string;
            libraryCode: string;
            sortOrder: number;
        };
        showMobileMain: boolean;
        memberNo: string;
        alternativeId: string;
        lastUpdated: Date;
        branchGroup: {
            id: number;
            name: string;
        };
        isPortalLogin: boolean;
        patronType: {
            id: number;
            name: string;
        };
        disableServices: string[];
        hasFamily: boolean;
        name: string;
        printMemberNo: string;
        patronState: {
            id: number;
            name: string;
        };
        id: number;
        multiTypePatrons: string[];
        isExpired: boolean;
        isFamilyLogin: boolean;
    };
}