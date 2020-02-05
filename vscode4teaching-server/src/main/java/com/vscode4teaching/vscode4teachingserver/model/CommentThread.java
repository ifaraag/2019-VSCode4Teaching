package com.vscode4teaching.vscode4teachingserver.model;

import java.time.LocalDateTime;
import java.util.List;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.ManyToOne;
import javax.persistence.OneToMany;

import com.fasterxml.jackson.annotation.JsonView;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentThreadViews;
import com.vscode4teaching.vscode4teachingserver.model.views.CommentViews;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
@Entity
public class CommentThread {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @JsonView(CommentThreadViews.GeneralView.class)
    private Long id;

    @ManyToOne
    @JsonView(CommentThreadViews.FileView.class)
    private ExerciseFile file;

    @OneToMany
    @JsonView(CommentThreadViews.GeneralView.class)
    private List<Comment> comments;

    @JsonView(CommentThreadViews.GeneralView.class)
    private Integer line;

    @CreationTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime createDateTime;

    @UpdateTimestamp
    @JsonView(CommentViews.GeneralView.class)
    private LocalDateTime updateDateTime;

    public CommentThread(ExerciseFile file, Integer line) {
        this.file = file;
        this.line = line;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ExerciseFile getFile() {
        return file;
    }

    public void setFile(ExerciseFile file) {
        this.file = file;
    }

    public Integer getLine() {
        return line;
    }

    public void setLine(Integer line) {
        this.line = line;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }

    public LocalDateTime getCreateDateTime() {
        return createDateTime;
    }

    public void setCreateDateTime(LocalDateTime createDateTime) {
        this.createDateTime = createDateTime;
    }

    public LocalDateTime getUpdateDateTime() {
        return updateDateTime;
    }

    public void setUpdateDateTime(LocalDateTime updateDateTime) {
        this.updateDateTime = updateDateTime;
    }
    
    
}