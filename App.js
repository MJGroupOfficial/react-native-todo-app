import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context'

const AsyncStorage = {
  getItem: async (key) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return null;
  },
  setItem: async (key, value) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    }
    return;
  },
};

const Feather = ({ name, size, color, style }) => (
  <Text style={[{ fontSize: size || 20, color: color || 'white', fontFamily: 'serif' }, style]}>
    {
      name === 'moon' ? '🌙' :
      name === 'sun' ? '☀️' :
      name === 'plus-circle' ? '➕' :
      name === 'trash-2' ? '🗑️' :
      name === 'search' ? '🔍' :
      name === 'x' ? '⚔️️' :
      name === 'alert-triangle' ? '⚠️' :
      name === 'check-circle' ? '✅' :
      name === 'info' ? 'ℹ️' :
      name === 'check' ? '✓' :
      name === 'x-circle' ? 'ⓧ' :
      '...'
    }
  </Text>
);

const LIGHT_COLORS = {
  primary: '#4a6bff',
  danger: '#ff4a4a',
  warning: '#ffb74a',
  success: '#4aff7d',
  text: '#2d3748',
  bg: '#f8f9fa',
  cardBg: '#ffffff',
  navbarBg: '#4a6bff',
  navbarText: 'white',
  inputBorder: '#ccc',
};

const DARK_COLORS = {
  primary: '#5d7aff',
  danger: '#ff6b6b',
  warning: '#ffc46b',
  success: '#6bff96',
  text: '#f8f9fa',
  bg: '#1a202c',
  cardBg: '#2d3748',
  navbarBg: '#3a4452',
  navbarText: '#f8f9fa',
  inputBorder: '#555',
};

const CustomAlert = React.memo(({ message, type, isDarkMode, onClose, colors }) => {
  if (!message) return null;

  const getAlertStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: isDarkMode ? '#1e4620' : '#d4edda', borderColor: isDarkMode ? '#6c757d' : '#c3e6cb', color: isDarkMode ? LIGHT_COLORS.text : '#155724' };
      case 'error':
        return { backgroundColor: isDarkMode ? '#4a171a' : '#f8d7da', borderColor: isDarkMode ? '#6c757d' : '#f5c6cb', color: isDarkMode ? LIGHT_COLORS.text : '#721c24' };
      case 'warning':
        return { backgroundColor: isDarkMode ? '#5a401c' : '#fff3cd', borderColor: isDarkMode ? '#6c757d' : '#ffeeba', color: isDarkMode ? LIGHT_COLORS.text : '#856404' };
      default:
        return { backgroundColor: isDarkMode ? '#283645' : '#e2e3e5', borderColor: isDarkMode ? '#6c757d' : '#d6d8db', color: isDarkMode ? LIGHT_COLORS.text : '#383d41' };
    }
  };

  const alertStyle = getAlertStyle();
  const iconName = type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'alert-triangle';
  const textColor = { color: alertStyle.color };

  return (
    <View style={[styles.alertContainer, { backgroundColor: alertStyle.backgroundColor, borderColor: alertStyle.borderColor }]}>
      <Feather name={iconName} size={20} color={alertStyle.color} style={{ marginRight: 8 }} />
      <Text style={[styles.alertText, textColor]}>{message}</Text>
      <TouchableOpacity onPress={onClose} style={styles.alertCloseButton} accessibilityLabel="Close notification">
        <Feather name="x" size={18} color={alertStyle.color} />
      </TouchableOpacity>
    </View>
  );
});

const TaskItem = React.memo(({ item, index, onDelete, colors, searchTerm }) => {
  const highlight = (text) => {
    if (!searchTerm || !text) return <Text style={{ color: colors.text }}>{text}</Text>;
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return (
      <Text style={{ color: colors.text }}>
        {parts.map((part, i) =>
          part.toLowerCase() === searchTerm.toLowerCase() ? (
            <Text key={i} style={{ backgroundColor: colors.warning, borderRadius: 3, color: '#000' }}>{part}</Text>
          ) : (
            part
          )
        )}
      </Text>
    );
  };

  return (
    <View style={[styles.taskItem, { backgroundColor: colors.cardBg, borderColor: colors.inputBorder }]}>
      <View style={styles.taskIndex}>
        <Text style={{ color: colors.text, fontWeight: 'bold' }}>{index + 1}</Text>
      </View>
      <View style={styles.taskContent}>
        <View style={styles.taskTextWrapper}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>{highlight(item.title)}</Text>
          <Text style={[styles.taskDescription, { color: colors.text }]}>
            {item.description ? highlight(item.description) : <Text style={{ color: '#888' }}>No description</Text>}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => onDelete(item.id)}
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          accessibilityLabel={`Delete task: ${item.title}`}
        >
          <Feather name="trash-2" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
});

const ConfirmationModal = ({ isVisible, onClose, onConfirm, colors }) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (!isVisible) {
      setIsConfirmed(false);
    }
  }, [isVisible]);

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.cardBg }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.inputBorder }]}>
            <Feather name="alert-triangle" size={24} color={colors.danger} />
            <Text style={[styles.modalTitle, { color: colors.danger, marginLeft: 10 }]}>Confirm Clear All</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalClose}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <Text style={[styles.modalText, { color: colors.text }]}>
              Are you sure you want to permanently delete all tasks? This action cannot be undone.
            </Text>

            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setIsConfirmed(!isConfirmed)}
              accessibilityLabel="Confirm permanent deletion of all tasks"
            >
              <View style={[styles.checkbox, { borderColor: colors.primary, backgroundColor: isConfirmed ? colors.primary : colors.cardBg }]}>
                {isConfirmed && <Feather name="check" size={16} color="white" />}
              </View>
              <Text style={[styles.modalText, { color: colors.text, marginLeft: 10, flex: 1 }]}>
                I understand this will delete all my tasks permanently
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity onPress={onClose} style={[styles.modalButton, { backgroundColor: '#888' }]}>
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              disabled={!isConfirmed}
              style={[styles.modalButton, { backgroundColor: !isConfirmed ? '#aaa' : colors.danger, marginLeft: 10 }]}
            >
              <Text style={styles.modalButtonText}>Clear All Tasks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Separate component for TaskList to avoid re-renders
const TaskListComponent = React.memo(({ tasks, searchTerm, performSearch, deleteTask, colors, scrollEnabled = true }) => {
  return (
    <View style={[styles.listSection]}>
      <View style={[styles.card, { backgroundColor: colors.cardBg, padding: 16 }]}>
        <View style={styles.listHeader}>
          <Text style={[styles.listTitle, { color: colors.text }]}>Your Tasks</Text>
          <TouchableOpacity
            onPress={() => {
              // showAlert('Export/Print feature mocked. In a real app, this would use a Share dialog.', 'info');
            }}
            style={[styles.actionButton, styles.printButton, { backgroundColor: colors.cardBg, borderColor: colors.text }]}
            accessibilityLabel="Print or Export Task List"
          >
            <Feather name="info" size={18} color={colors.text} style={{ marginRight: 5 }} />
            <Text style={{ color: colors.text }}>Export</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.searchContainer}>
          <TextInput
            style={[styles.searchInput, { borderColor: colors.inputBorder, color: colors.text }]}
            value={searchTerm}
            onChangeText={performSearch}
            placeholder="Search tasks by title or description"
            placeholderTextColor="#888"
            accessibilityLabel="Search Tasks Input"
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity
              onPress={() => performSearch('')}
              style={styles.clearSearchButton}
              accessibilityLabel="Clear search term"
            >
              <Feather name="x" size={20} color={colors.text} />
            </TouchableOpacity>
          )}
        </View>

        {tasks.length > 0 ? (
          <FlatList
            data={tasks}
            renderItem={({ item, index }) => (
              <TaskItem
                item={item}
                index={index}
                onDelete={deleteTask}
                colors={colors}
                searchTerm={searchTerm}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 10 }}
            scrollEnabled={scrollEnabled}
            ListEmptyComponent={() => (
              <Text style={[styles.emptyText, { color: colors.text }]}>
                No tasks found matching "{searchTerm}".
              </Text>
            )}
          />
        ) : (
          <Text style={[styles.emptyText, { color: colors.text, marginTop: 20 }]}>
            {searchTerm ? `No tasks found matching "${searchTerm}".` : 'No tasks found. Add a task to get started!'}
          </Text>
        )}
      </View>
    </View>
  );
});

// Separate component for TaskForm to avoid re-renders
const TaskFormComponent = React.memo(({ 
  title, 
  description, 
  setTitle, 
  setDescription, 
  addTask, 
  setIsModalVisible, 
  colors 
}) => {
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg }]}>
      <Text style={[styles.cardTitle, { color: colors.text }]}>Add New Task</Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.inputBorder, color: colors.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Add a descriptive title"
          placeholderTextColor="#888"
          maxLength={100}
          accessibilityLabel="Task Title Input"
        />
        <Text style={[styles.helperText, { color: '#888' }]}>Add a descriptive title for your task</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea, { borderColor: colors.inputBorder, color: colors.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional details"
          placeholderTextColor="#888"
          multiline
          numberOfLines={3}
          accessibilityLabel="Task Description Input"
        />
        <Text style={[styles.helperText, { color: '#888' }]}>Optional details about your task</Text>
      </View>

      <View style={styles.buttonStack}>
        <TouchableOpacity
          onPress={addTask}
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          accessibilityLabel="Add Task button"
        >
          <Feather name="plus-circle" size={20} color="white" style={{ marginRight: 5 }} />
          <Text style={styles.buttonText}>Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsModalVisible(true)}
          style={[styles.actionButton, styles.clearButton, { borderColor: colors.danger, backgroundColor: colors.cardBg }]}
          accessibilityLabel="Clear All Tasks button"
        >
          <Feather name="trash-2" size={20} color={colors.danger} style={{ marginRight: 5 }} />
          <Text style={[styles.buttonText, { color: colors.danger }]}>Clear All Tasks</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const App = () => {
  const [tasks, setTasks] = useState([]);
  const [originalTasks, setOriginalTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [alert, setAlert] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentView, setCurrentView] = useState('home');

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const performSearch = useCallback((term, taskList = originalTasks) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setTasks(taskList);
    } else {
      const filtered = taskList.filter(task => {
        const lowerTerm = term.toLowerCase();
        return (
          task.title.toLowerCase().includes(lowerTerm) ||
          (task.description && task.description.toLowerCase().includes(lowerTerm))
        );
      });
      setTasks(filtered);
    }
  }, [originalTasks]);

  const saveTasks = useCallback(async (newTasks) => {
    try {
      await AsyncStorage.setItem('todos', JSON.stringify(newTasks));
      setOriginalTasks(newTasks);
      if (searchTerm) {
        performSearch(searchTerm, newTasks);
      } else {
        setTasks(newTasks);
      }
    } catch (e) {
      console.error('Failed to save tasks:', e);
      showAlert('Failed to save tasks. Your changes may not persist.', 'error');
    }
  }, [searchTerm, performSearch]);

  const showAlert = useCallback((message, type = 'success', duration = 2000) => {
    setAlert({ message, type });
    const timer = setTimeout(() => setAlert(null), duration);
    return () => clearTimeout(timer);
  }, []);

  const loadTasks = useCallback(async () => {
    try {
      const storedItems = await AsyncStorage.getItem('todos');
      const storedTheme = await AsyncStorage.getItem('darkMode');

      if (storedTheme !== null) {
        setIsDarkMode(storedTheme === 'true');
      } else {
        const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(systemPrefersDark);
      }

      if (storedItems) {
        const parsedTasks = JSON.parse(storedItems);
        setTasks(parsedTasks);
        setOriginalTasks(parsedTasks);
      }
    } catch (e) {
      console.error('Failed to load data:', e);
      showAlert('Failed to load tasks and theme.', 'error');
    }
  }, [showAlert]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const toggleTheme = useCallback(async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await AsyncStorage.setItem('darkMode', String(newMode));
    } catch (e) {
      showAlert('Failed to save theme preference.', 'error');
    }
  }, [isDarkMode, showAlert]);

  const addTask = useCallback(() => {
    if (!title.trim()) {
      showAlert('Task title cannot be empty!', 'error');
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
      completed: false,
    };

    const newTasks = [newTask, ...originalTasks];
    setTasks(newTasks);
    saveTasks(newTasks);

    setTitle('');
    setDescription('');
    showAlert('Task added successfully!', 'success');

  }, [title, description, originalTasks, saveTasks, showAlert]);

  const deleteTask = useCallback((taskId) => {
    const taskToDelete = originalTasks.find(t => t.id === taskId);
    if (!taskToDelete) return;

    const newTasks = originalTasks.filter(task => task.id !== taskId);
    setTasks(newTasks);
    saveTasks(newTasks);
    showAlert(`Task "${taskToDelete.title}" deleted`, 'success');

  }, [originalTasks, saveTasks, showAlert]);

  const clearAllTasks = useCallback(() => {
    saveTasks([]);
    setTasks([]);
    setIsModalVisible(false);
    showAlert('All tasks have been cleared!', 'success');
  }, [saveTasks, showAlert]);

  const Header = useCallback(() => (
    <View style={[styles.header, { backgroundColor: colors.navbarBg }]}>
      <Text style={[styles.logo, { color: colors.navbarText }]}>TODO App</Text>

      <View style={styles.navContainer}>
        <TouchableOpacity
          onPress={() => setCurrentView('home')}
          style={[styles.navButton, currentView === 'home' && { borderBottomColor: colors.navbarText, borderBottomWidth: 2 }]}
          accessibilityLabel="Go to Home view and Add Task form"
        >
          <Text style={[styles.navText, { color: colors.navbarText }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setCurrentView('tasks')}
          style={[styles.navButton, currentView === 'tasks' && { borderBottomColor: colors.navbarText, borderBottomWidth: 2 }]}
          accessibilityLabel="Go to My Tasks list"
        >
          <Text style={[styles.navText, { color: colors.navbarText }]}>My Tasks ({originalTasks.length})</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={toggleTheme}
        style={styles.themeToggle}
        accessibilityLabel={`Toggle ${isDarkMode ? 'light' : 'dark'} mode`}
      >
        <Feather name={isDarkMode ? 'sun' : 'moon'} size={24} color={colors.navbarText} />
      </TouchableOpacity>
    </View>
  ), [colors, currentView, originalTasks.length, toggleTheme, isDarkMode]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} backgroundColor={colors.navbarBg} />
      <Header />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <View style={styles.mainContent}>
          {currentView === 'home' && (
            <>
              <TaskFormComponent
                title={title}
                description={description}
                setTitle={setTitle}
                setDescription={setDescription}
                addTask={addTask}
                setIsModalVisible={setIsModalVisible}
                colors={colors}
              />
            </>
          )}
          {currentView === 'tasks' && (
            <TaskListComponent
              tasks={tasks}
              searchTerm={searchTerm}
              performSearch={performSearch}
              deleteTask={deleteTask}
              colors={colors}
              scrollEnabled={true}
            />
          )}
        </View>
      </KeyboardAvoidingView>

      <ConfirmationModal
        isVisible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onConfirm={clearAllTasks}
        colors={colors}
      />
      <CustomAlert
        message={alert?.message}
        type={alert?.type}
        isDarkMode={isDarkMode}
        onClose={() => setAlert(null)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    height: 60,
  },
  logo: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  navContainer: {
    flexDirection: 'row',
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  navText: {
    fontSize: 16,
  },
  themeToggle: {
    padding: 4,
  },

  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonStack: {
    marginTop: 10,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 14,
  },
  clearButton: {
    borderWidth: 1,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },

  listSection: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  printButton: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 8,
  },
  searchContainer: {
    marginBottom: 15,
    position: 'relative',
    justifyContent: 'center',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    paddingRight: 40,
  },
  clearSearchButton: {
    position: 'absolute',
    right: 12,
    padding: 5,
  },
  taskItem: {
    flexDirection: 'row',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  taskIndex: {
    width: 30,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTextWrapper: {
    flex: 1,
    marginRight: 10,
  },
  taskTitle: {
    fontWeight: '600',
    fontSize: 16,
  },
  taskDescription: {
    fontSize: 14,
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 50,
  },
  emptyText: {
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 16,
    opacity: 0.7,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  modalClose: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalText: {
    fontSize: 15,
    marginBottom: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  
  alertContainer: {
    position: 'absolute',
    top: 70, // Below header
    left: 16,
    right: 16,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 9999, // Very high zIndex to ensure it's on top
    borderLeftWidth: 5,
    elevation: 10, // For Android
    shadowColor: '#000', // For iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    marginRight: 10,
  },
  alertCloseButton: {
    padding: 5,
  }
});

export default App;