package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.ExerciseUserInfoViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

@Entity
public class ExerciseUserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private Long id;

    @ManyToOne
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private Exercise exercise;

    @ManyToOne
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private User user;

    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private boolean finished = false;

    @CreationTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(ExerciseUserInfoViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public ExerciseUserInfo() {

    }

    public ExerciseUserInfo(Exercise exercise, User user) {
        this.exercise = exercise;
        this.user = user;
    }

    public Exercise getExercise() {
        return exercise;
    }

    public void setExercise(Exercise exercise) {
        this.exercise = exercise;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public boolean isFinished() {
        return finished;
    }

    public void setFinished(boolean finished) {
        this.finished = finished;
    }

}