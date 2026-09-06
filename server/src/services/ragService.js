const supabase = require("../config/supabase");

const retrieveKnowledge = async (query) => {
  try {
    const normalizedQuery = query.toLowerCase();

    const stopWords = new Set([
      "what",
      "which",
      "how",
      "can",
      "could",
      "would",
      "should",
      "is",
      "are",
      "the",
      "a",
      "an",
      "for",
      "my",
      "me",
      "i",
      "we",
      "our",
      "to",
      "of",
      "in",
      "on",
      "with",
      "and",
      "or",
      "do",
      "does",
      "help",
      "available",
      "tell",
      "about"
    ]);

    const keywords = normalizedQuery
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2 && !stopWords.has(word))
      .slice(0, 6);

    if (keywords.length === 0) {
      return [];
    }

    // Detect the type of information the user is asking for
    const isGovernmentSchemeQuery =
      normalizedQuery.includes("scheme") ||
      normalizedQuery.includes("subsidy") ||
      normalizedQuery.includes("government") ||
      normalizedQuery.includes("loan") ||
      normalizedQuery.includes("financial support");

    let queryBuilder = supabase
      .from("knowledge_base")
      .select("id, title, content, category, source, source_url");

    // For government-support questions, prioritize government schemes
    if (isGovernmentSchemeQuery) {
      queryBuilder = queryBuilder.eq("category", "Government Scheme");
    }

    const searchConditions = keywords
      .map(
        (keyword) =>
          `title.ilike.%${keyword}%,content.ilike.%${keyword}%,category.ilike.%${keyword}%`
      )
      .join(",");

    const { data, error } = await queryBuilder
      .or(searchConditions)
      .limit(5);

    if (error) {
      console.error("RAG retrieval error:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("RAG service error:", error);
    return [];
  }
};

module.exports = {
  retrieveKnowledge
};