import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { cn } from "@/lib/utils";
import { useTheme } from "../../components/theme-provider";
import { useToast } from "../../components/ui/toast";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  X
} from 'lucide-react';
import { getAssessmentDetails, updateAssessment } from '../../api/axios.api';

const EditAssessment = () => {
  const { assessmentId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [assessment, setAssessment] = useState({
    title: '',
    field: '',
    skillsAssessed: [],
    difficulty: 'Beginner',
    duration: 60,
    questions: []
  });

  useEffect(() => {
    fetchAssessment();
  }, [assessmentId]);

  const fetchAssessment = async () => {
    try {
      const data = await getAssessmentDetails(assessmentId);

      // Clean up the received data
      const cleanedAssessment = {
        title: data.assessment.title,
        field: data.assessment.field,
        skillsAssessed: data.assessment.skillsAssessed || [],
        difficulty: data.assessment.difficulty,
        duration: data.assessment.duration,
        questions: data.assessment.questions.map(q => ({
          question: q.question,
          skillCategory: q.skillCategory,
          difficultyLevel: q.difficultyLevel,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      setAssessment(cleanedAssessment);
    } catch (error) {
      console.error('Error fetching assessment:', error);
      toast({
        title: "Error",
        description: "Failed to load assessment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAssessment(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim());
    setAssessment(prev => ({
      ...prev,
      skillsAssessed: skills
    }));
  };

  const addQuestion = () => {
    setAssessment(prev => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question: '',
          options: [
            { text: '', isCorrect: true },
            { text: '', isCorrect: false }
          ],
          skillCategory: '',
          difficultyLevel: 'Easy'
        }
      ]
    }));
  };

  const removeQuestion = (index) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) =>
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleOptionChange = (questionIndex, optionIndex, field, value) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map((q, qIndex) =>
        qIndex === questionIndex ? {
          ...q,
          options: q.options.map((opt, oIndex) =>
            oIndex === optionIndex ? { ...opt, [field]: value } : opt
          )
        } : q
      )
    }));
  };

  const addOption = (questionIndex) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === questionIndex ? {
          ...q,
          options: [...q.options, { text: '', isCorrect: false }]
        } : q
      )
    }));
  };

  const removeOption = (questionIndex, optionIndex) => {
    setAssessment(prev => ({
      ...prev,
      questions: prev.questions.map((q, index) =>
        index === questionIndex ? {
          ...q,
          options: q.options.filter((_, oIndex) => oIndex !== optionIndex)
        } : q
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Clean up the assessment data
      const cleanedAssessment = {
        ...assessment,
        questions: assessment.questions.map(q => ({
          question: q.question,
          skillCategory: q.skillCategory,
          difficultyLevel: q.difficultyLevel,
          options: q.options.map(opt => ({
            text: opt.text,
            isCorrect: opt.isCorrect
          }))
        }))
      };

      const response = await updateAssessment(assessmentId, cleanedAssessment);

      toast({
        title: "Success",
        description: "Assessment updated successfully",
      });
      navigate('/instructor/assessments');
    } catch (error) {
      console.error('Error updating assessment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update assessment",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-[#6938EF]" />
          <span className="text-muted-foreground">Loading assessment...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Edit Assessment - Instructor Dashboard</title>
        <meta
          name="description"
          content="Edit and update assessment details"
        />
      </Helmet>

      <div className="p-8">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate(`/instructor/assessments/${assessmentId}`)}
            className="p-2 hover:bg-accent rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold">Edit Assessment</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Details */}
          <div className={cn(
            "p-6 rounded-2xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <h2 className="text-xl font-semibold mb-6">Basic Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  name="title"
                  value={assessment.title}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                  )}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Field</label>
                <input
                  type="text"
                  name="field"
                  value={assessment.field}
                  onChange={handleInputChange}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                  )}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Skills Assessed (comma-separated)</label>
                <input
                  type="text"
                  value={assessment.skillsAssessed.join(', ')}
                  onChange={handleSkillsChange}
                  className={cn(
                    "w-full px-4 py-2 rounded-lg border bg-background",
                    "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                  )}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Difficulty</label>
                  <select
                    name="difficulty"
                    value={assessment.difficulty}
                    onChange={handleInputChange}
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                    )}
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={assessment.duration}
                    onChange={handleInputChange}
                    min="5"
                    max="240"
                    className={cn(
                      "w-full px-4 py-2 rounded-lg border bg-background",
                      "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                    )}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className={cn(
            "p-6 rounded-2xl border",
            theme === 'dark' ? 'bg-[#110C1D] border-[#6938EF]/20' : 'bg-white border-border'
          )}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Questions</h2>
              <button
                type="button"
                onClick={addQuestion}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl",
                  "bg-[#6938EF] text-white hover:bg-[#5B2FD1] transition-colors duration-200"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">Add Question</span>
              </button>
            </div>

            <div className="space-y-6">
              {assessment.questions.map((question, qIndex) => (
                <div
                  key={qIndex}
                  className={cn(
                    "p-6 rounded-xl border",
                    theme === 'dark' ? 'border-[#6938EF]/20' : 'border-border'
                  )}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium">Question {qIndex + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Question Text</label>
                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                        className={cn(
                          "w-full px-4 py-2 rounded-lg border bg-background",
                          "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                        )}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Skill Category</label>
                        <input
                          type="text"
                          value={question.skillCategory}
                          onChange={(e) => handleQuestionChange(qIndex, 'skillCategory', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 rounded-lg border bg-background",
                            "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                          )}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Difficulty Level</label>
                        <select
                          value={question.difficultyLevel}
                          onChange={(e) => handleQuestionChange(qIndex, 'difficultyLevel', e.target.value)}
                          className={cn(
                            "w-full px-4 py-2 rounded-lg border bg-background",
                            "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                          )}
                          required
                        >
                          <option value="Easy">Easy</option>
                          <option value="Medium">Medium</option>
                          <option value="Hard">Hard</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium">Options</label>
                        <button
                          type="button"
                          onClick={() => addOption(qIndex)}
                          className="text-sm text-[#6938EF] hover:underline"
                          disabled={question.options.length >= 6}
                        >
                          Add Option
                        </button>
                      </div>

                      <div className="space-y-2">
                        {question.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-4">
                            <input
                              type="text"
                              value={option.text}
                              onChange={(e) => handleOptionChange(qIndex, oIndex, 'text', e.target.value)}
                              className={cn(
                                "flex-1 px-4 py-2 rounded-lg border bg-background",
                                "focus:outline-none focus:ring-2 focus:ring-[#6938EF]/50"
                              )}
                              required
                            />
                            <label className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${qIndex}`}
                                checked={option.isCorrect}
                                onChange={() => {
                                  const updatedOptions = question.options.map((opt, i) => ({
                                    ...opt,
                                    isCorrect: i === oIndex
                                  }));
                                  setAssessment(prev => ({
                                    ...prev,
                                    questions: prev.questions.map((q, i) =>
                                      i === qIndex ? { ...q, options: updatedOptions } : q
                                    )
                                  }));
                                }}
                                className="text-[#6938EF]"
                              />
                              <span className="text-sm">Correct</span>
                            </label>
                            {question.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors duration-200"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/instructor/assessments/${assessmentId}`)}
              className={cn(
                "px-6 py-2 rounded-xl border",
                "hover:bg-accent/50 transition-colors duration-200",
                theme === 'dark' ? 'border-[#6938EF]/20' : 'border-border'
              )}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-6 py-2 rounded-xl",
                "bg-[#6938EF] text-white hover:bg-[#5B2FD1] transition-colors duration-200",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default EditAssessment;