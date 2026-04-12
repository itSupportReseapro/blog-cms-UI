"use client";

import { useState } from "react";
import { defaultDoc, docToHTML, htmlToDoc } from "@/components/pdp-rich-editor";
import {
  CMS_DEFAULTS,
  CMS_RESOURCE_IDS,
  createAboutUs,
  createAboutUsMissionAndVision,
  createAboutUsOurValues,
  getAboutUsById,
  getAboutUsMissionAndVisionById,
  getAboutUsOurValuesById,
  getCmsErrorMessage,
  updateAboutUs,
  updateAboutUsMissionAndVision,
  updateAboutUsOurValues,
} from "@/services/cms.service";

const ABOUT_STORAGE_KEYS = {
  about: "cms.aboutUsId",
  missionVision: "cms.aboutUsMissionVisionId",
  values: "cms.aboutUsOurValuesId",
};

export function createInitialAboutUsState() {
  return {
    about: {
      title: "",
      imageName: "",
      imageFile: null,
      subText: "",
      description: defaultDoc(),
    },
    missionVision: {
      mission: {
        title: "",
        imageName: "",
        imageFile: null,
        description: defaultDoc(),
      },
      vision: {
        title: "",
        imageName: "",
        imageFile: null,
        description: defaultDoc(),
      },
    },
    values: {
      title: "",
      subtitle: "",
      items: Array.from({ length: 4 }, () => ({
        title: "",
        iconName: "",
        iconFile: null,
        description: "",
      })),
    },
  };
}

function getHtmlDoc(value) {
  return value ? htmlToDoc(value) : defaultDoc();
}

function persistResourceId(key, id) {
  if (typeof window === "undefined" || !id) return;
  window.localStorage.setItem(key, String(id));
}

function resolveResourceId(key, fallbackId) {
  if (typeof window === "undefined") return fallbackId;
  return window.localStorage.getItem(key) || fallbackId;
}

function mapAboutResponseToState(entity) {
  if (!entity) {
    return createInitialAboutUsState().about;
  }

  return {
    title: entity.heading || "",
    imageName: entity.img || "",
    imageFile: null,
    subText: entity.sub_heading || "",
    description: getHtmlDoc(entity.description),
  };
}

function mapMissionVisionResponseToState(entity) {
  if (!entity) {
    return createInitialAboutUsState().missionVision;
  }

  return {
    mission: {
      title: entity.heading_1 || "",
      imageName: entity.img_1 || "",
      imageFile: null,
      description: getHtmlDoc(entity.description_1),
    },
    vision: {
      title: entity.heading_2 || "",
      imageName: entity.img_2 || "",
      imageFile: null,
      description: getHtmlDoc(entity.description_2),
    },
  };
}

function mapValuesResponseToState(entity) {
  if (!entity) {
    return createInitialAboutUsState().values;
  }

  return {
    title: entity.heading || "",
    subtitle: entity.sub_heading || "",
    items: Array.from({ length: 4 }, (_, index) => {
      const itemNumber = index + 1;

      return {
        title: entity[`title_${itemNumber}`] || "",
        iconName: entity[`icon_${itemNumber}`] || "",
        iconFile: null,
        description: entity[`description_${itemNumber}`] || "",
      };
    }),
  };
}

export default function useAboutUs() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recordIds, setRecordIds] = useState({
    about: null,
    missionVision: null,
    values: null,
  });

  const loadAboutUsContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const aboutId = resolveResourceId(ABOUT_STORAGE_KEYS.about, CMS_RESOURCE_IDS.aboutUs);
      const missionVisionId = resolveResourceId(
        ABOUT_STORAGE_KEYS.missionVision,
        CMS_RESOURCE_IDS.aboutUsMissionVision
      );
      const valuesId = resolveResourceId(
        ABOUT_STORAGE_KEYS.values,
        CMS_RESOURCE_IDS.aboutUsOurValues
      );

      const [about, missionVision, values] = await Promise.all([
        getAboutUsById(aboutId),
        getAboutUsMissionAndVisionById(missionVisionId),
        getAboutUsOurValuesById(valuesId),
      ]);

      if (about?.id) persistResourceId(ABOUT_STORAGE_KEYS.about, about.id);
      if (missionVision?.id) persistResourceId(ABOUT_STORAGE_KEYS.missionVision, missionVision.id);
      if (values?.id) persistResourceId(ABOUT_STORAGE_KEYS.values, values.id);

      setRecordIds({
        about: about?.id || null,
        missionVision: missionVision?.id || null,
        values: values?.id || null,
      });

      return {
        about: mapAboutResponseToState(about),
        missionVision: mapMissionVisionResponseToState(missionVision),
        values: mapValuesResponseToState(values),
      };
    } catch (err) {
      console.error("LOAD ABOUT US ERROR:", err);
      setError(getCmsErrorMessage(err, "Failed to load About Us content"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const saveAboutUsContent = async (state) => {
    setLoading(true);
    setError(null);

    try {
      const aboutCreatePayload = {
        app_id: CMS_DEFAULTS.appId,
        heading: state.about.title,
        sub_heading: state.about.subText,
        description: docToHTML(state.about.description),
        img: state.about.imageName,
        obj_1: "",
        obj_2: "",
        obj_3: "",
        obj_4: "",
        obj_5: "",
        status: CMS_DEFAULTS.status,
        created_by: CMS_DEFAULTS.createdBy,
      };

      const aboutUpdatePayload = {
        heading: state.about.title,
        sub_heading: state.about.subText,
        description: docToHTML(state.about.description),
        img: state.about.imageName,
      };

      const missionVisionCreatePayload = {
        app_id: CMS_DEFAULTS.appId,
        heading_1: state.missionVision.mission.title,
        description_1: docToHTML(state.missionVision.mission.description),
        img_1: state.missionVision.mission.imageName,
        heading_2: state.missionVision.vision.title,
        description_2: docToHTML(state.missionVision.vision.description),
        img_2: state.missionVision.vision.imageName,
        obj_1: "",
        obj_2: "",
        obj_3: "",
        obj_4: "",
        obj_5: "",
        status: CMS_DEFAULTS.status,
        created_by: CMS_DEFAULTS.createdBy,
      };

      const missionVisionUpdatePayload = {
        heading_1: state.missionVision.mission.title,
        description_1: docToHTML(state.missionVision.mission.description),
        img_1: state.missionVision.mission.imageName,
        heading_2: state.missionVision.vision.title,
        description_2: docToHTML(state.missionVision.vision.description),
        img_2: state.missionVision.vision.imageName,
      };

      const valuesCreatePayload = state.values.items.reduce(
        (payload, item, index) => {
          const itemNumber = index + 1;
          payload[`title_${itemNumber}`] = item.title;
          payload[`description_${itemNumber}`] = item.description;
          payload[`icon_${itemNumber}`] = item.iconName;
          return payload;
        },
        {
          app_id: CMS_DEFAULTS.appId,
          heading: state.values.title,
          sub_heading: state.values.subtitle,
          obj_1: "",
          obj_2: "",
          obj_3: "",
          obj_4: "",
          obj_5: "",
          status: CMS_DEFAULTS.status,
          created_by: CMS_DEFAULTS.createdBy,
        }
      );

      const valuesUpdatePayload = state.values.items.reduce(
        (payload, item, index) => {
          const itemNumber = index + 1;
          payload[`title_${itemNumber}`] = item.title;
          payload[`description_${itemNumber}`] = item.description;
          payload[`icon_${itemNumber}`] = item.iconName;
          return payload;
        },
        {
          heading: state.values.title,
          sub_heading: state.values.subtitle,
        }
      );

      const [aboutResponse, missionVisionResponse, valuesResponse] = await Promise.all([
        recordIds.about
          ? updateAboutUs(recordIds.about, aboutUpdatePayload)
          : createAboutUs(aboutCreatePayload),
        recordIds.missionVision
          ? updateAboutUsMissionAndVision(recordIds.missionVision, missionVisionUpdatePayload)
          : createAboutUsMissionAndVision(missionVisionCreatePayload),
        recordIds.values
          ? updateAboutUsOurValues(recordIds.values, valuesUpdatePayload)
          : createAboutUsOurValues(valuesCreatePayload),
      ]);

      const nextRecordIds = {
        about: aboutResponse?.data?.id || recordIds.about,
        missionVision: missionVisionResponse?.data?.id || recordIds.missionVision,
        values: valuesResponse?.data?.id || recordIds.values,
      };

      setRecordIds(nextRecordIds);

      if (nextRecordIds.about) persistResourceId(ABOUT_STORAGE_KEYS.about, nextRecordIds.about);
      if (nextRecordIds.missionVision) {
        persistResourceId(ABOUT_STORAGE_KEYS.missionVision, nextRecordIds.missionVision);
      }
      if (nextRecordIds.values) persistResourceId(ABOUT_STORAGE_KEYS.values, nextRecordIds.values);

      return nextRecordIds;
    } catch (err) {
      console.error("SAVE ABOUT US ERROR:", err);
      setError(getCmsErrorMessage(err, "Error saving About Us content"));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loadAboutUsContent,
    saveAboutUsContent,
    loading,
    error,
  };
}