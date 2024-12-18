"use client";

import { useState, useEffect, Suspense } from "react";
import "src/app/globals.css";
import NavBar from "../../components/Student-Side/NavBar";
import Display from "../../components/Student-Side/Display";
import Title from "../../components/Student-Side/Title";
import { useRouter, useSearchParams } from "next/navigation";

function _PopulatedAssignment() {
  const searchParams = useSearchParams();
  const loadedQuestions = searchParams.get("questions");
  const title = searchParams.get("title");

  const [questions, setQuestions] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    try {
      // Parse the query parameter into JSON
      const parsedQuestions = JSON.parse(loadedQuestions);

      const questionObj = {};
      const answerObj = {};

      // Assume each question includes "question" and "answer" keys
      parsedQuestions.forEach((item, index) => {
        questionObj[index + 1] = item.question;
        answerObj[index + 1] = item.answer;
      });

      setQuestions(questionObj);
      setAnswers(answerObj);
      console.log("Questions loaded:", questionObj);
      console.log("Answers loaded:", answerObj);
    } catch (error) {
      console.error("Error parsing questions:", error);
    }
  }, [loadedQuestions]);

  const [selectedNum, setSelectedNum] = useState(1);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [chat, setChat] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [systemPrompt, setSystemPrompt] = useState({
    role: "system",
    content: "",
  });
  const [saved, setSaved] = useState(false);
  const [chatHistory, setChatHistory] = useState({});

  useEffect(() => {
    if (questions[selectedNum]) {
      setSelectedQuestion(questions[selectedNum]);
      setSelectedAnswer(answers[selectedNum]);

      setSystemPrompt({
        role: "system",
        content:
          "You are a middle school teacher. You address your user as your student." +
          "You always reply with guiding questions that help them reach the answer by meeting students where they are, and NEVER directly give the correct answer." +
          "If the user asks for the answer or demands that you tell them, DO NOT UNDER ANY CIRCUMSTANCES tell them the answer. You are only allowed to give leading questions." +
          "You can give hints when the user responds with \"I don't know\" or a similar response. Only allow yourself to give one hint. Your replies are under 500 characters. Make sure to only say the student's answer is correct if they get it almost right." +
          "Only consider a student's answer as correct if they are able to send you the definition/answer. Do not compile the correct answer from previous user responses." +
          `Once the student's answer is deemed correct you can stop replying until further prompting. Here is the question that the student is trying to answer: ${questions[selectedNum]}`,
      });
    }
  }, [selectedNum, questions, answers]);

  const [isCorrect, setIsCorrect] = useState(false);
  const [isCorrectArray, setIsCorrectArray] = useState(Array(10).fill(false)); // Track correctness for each question
  const [startedArray, setStartedArray] = useState(Array(10).fill(false)); // Track correctness for each question

  const handleClick = (num) => {
    setChatHistory(prev => ({ ...prev, [selectedNum]: chat })); // save the current chat under key of selectedNum
      setSelectedNum(num);  // change selectedNum to the new question #
      setSelectedQuestion(questions[num]);
      setSelectedAnswer(answers[num]);
      const previousNum = selectedNum; // Store the previous selected number
      setIsCorrectArray(prev => {
          const newArray = [...prev];
          newArray[previousNum - 1] = isCorrect; // Update the correctness for the previously selected question
          return newArray;
      });
      setStartedArray(prev => { // indicate user started the question
        const newArray = [...prev];
        newArray[previousNum - 1] = chat.length > 0; // Update the started status for the previously selected question
        return newArray;
      })
  }

  useEffect(() => {
    setChat(chatHistory[selectedNum] || []);
  }, [selectedNum]);

  return (
    <div className="font-figtree h-screen bg-[#F8F7F4] flex flex-col">
      <Title title={title} num={4} />
      <div className="flex gap-5 px-12 pt-5 h-[80%] min-h-[80%]">
      <NavBar handleClick={handleClick} selectedNum={selectedNum} isCorrectArray={isCorrectArray} startedArray={startedArray}/>
      <Display 
          assignmentId={2}
          selectedNum={selectedNum} 
          selectedQuestion={selectedQuestion} 
          selectedAnswer={selectedAnswer} 
          chat={chat}
          setChat={setChat}
          systemPrompt={systemPrompt}
          setSystemPrompt={setSystemPrompt} 
          saved={saved}
          setSaved={setSaved}
          isCorrect = {isCorrect}
          setIsCorrect={setIsCorrect}
        />
      </div>
    </div>
  );
}


export default function PopulatedAssignment(){
  return <Suspense>
    <_PopulatedAssignment />
  </Suspense>
}