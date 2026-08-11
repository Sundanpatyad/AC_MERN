import { useQuery } from "react-query"
import { fetchCourseCategories } from "../services/operations/courseDetailsAPI"

export const CATEGORIES_QUERY_KEY = "categories"

// Categories change rarely and are needed by the navbar on every page, so every
// consumer shares a single cached request.
export const useCategories = () =>
  useQuery(CATEGORIES_QUERY_KEY, fetchCourseCategories, {
    staleTime: Infinity,
    cacheTime: Infinity,
  })
