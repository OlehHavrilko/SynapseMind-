import re
from typing import Dict, Any, List
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain import LLMChain, PromptTemplate
from langchain.chat_models import ChatOpenAI

class DocumentProcessor:
    def __init__(self):
        self.chunker = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=300,
            separators=["\n\n", "\n", "## ", "# ", "```", " "]
        )
        self.llm = ChatOpenAI(
            model="gpt-4-turbo-preview",
            temperature=0.3
        )

    async def process(
        self,
        content: str,
        source: str,
        user_id: str
    ) -> Dict[str, Any]:
        chunks = self.chunker.split_text(content)
        
        summary = await self._generate_summary(content)
        
        concepts = await self._extract_concepts(chunks)
        
        keywords = await self._extract_keywords(content)
        
        entities = await self._extract_entities(content)
        
        return {
            "chunks": chunks,
            "summary": summary,
            "concepts": concepts,
            "keywords": keywords,
            "entities": entities,
            "metadata": {
                "word_count": len(content.split()),
                "reading_time": len(content.split()) // 200,
                "source": source,
                "chunk_count": len(chunks)
            }
        }

    async def _generate_summary(self, content: str) -> str:
        prompt = PromptTemplate(
            template="""Summarize the following content in 2-3 sentences:

{content}

Summary:""",
            input_variables=["content"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        try:
            result = await chain.arun(content=content[:4000])
            return result.strip()
        except:
            return content[:200] + "..."

    async def _extract_concepts(self, chunks: List[str]) -> List[str]:
        all_concepts = []
        
        for chunk in chunks[:5]:
            prompt = PromptTemplate(
                template="""Extract 5-10 key concepts/terms from this text as a comma-separated list:

{chunk}

Concepts:""",
                input_variables=["chunk"]
            )
            
            chain = LLMChain(llm=self.llm, prompt=prompt)
            
            try:
                result = await chain.arun(chunk=chunk[:1000])
                concepts = [c.strip() for c in result.split(',')]
                all_concepts.extend(concepts)
            except:
                pass
        
        unique_concepts = list(set(all_concepts))[:20]
        return unique_concepts

    async def _extract_keywords(self, content: str) -> List[str]:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', content.lower())
        
        stop_words = {
            'that', 'this', 'with', 'from', 'have', 'been', 'will',
            'their', 'what', 'about', 'which', 'when', 'make', 'like',
            'time', 'just', 'know', 'take', 'people', 'into', 'year',
            'your', 'good', 'some', 'could', 'them', 'see', 'other',
            'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over'
        }
        
        filtered_words = [w for w in words if w not in stop_words]
        
        word_freq = {}
        for word in filtered_words:
            word_freq[word] = word_freq.get(word, 0) + 1
        
        sorted_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)
        
        return [word for word, _ in sorted_words[:20]]

    async def _extract_entities(self, content: str) -> Dict[str, List[str]]:
        prompt = PromptTemplate(
            template="""Extract named entities from this text. Return as JSON:

{{
  "people": [...],
  "organizations": [...],
  "locations": [...],
  "technologies": [...]
}}

Text: {content}

Entities:""",
            input_variables=["content"]
        )
        
        chain = LLMChain(llm=self.llm, prompt=prompt)
        
        try:
            result = await chain.arun(content=content[:3000])
            import json
            return json.loads(result.strip())
        except:
            return {
                "people": [],
                "organizations": [],
                "locations": [],
                "technologies": []
            }
