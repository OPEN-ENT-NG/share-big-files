package fr.openent.sharebigfiles.to;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.vertx.core.json.JsonObject;

import java.util.Arrays;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BigFile {

    public enum Status {
        Deleted, ToKeep, ToDelete
    }

    private final String id;
    private final String fileId;
    private final Status status;
    private final boolean outdated;

    @JsonCreator
    public BigFile(@JsonProperty("_id") String id, @JsonProperty("fileId") String fileId, @JsonProperty("checkOnDisk") String status, @JsonProperty("outdated") boolean outdated) {
        this.id = id;
        this.fileId = fileId;
        this.outdated = outdated;
        this.status = Arrays.stream(Status.values()).filter(a -> a.name().equals(status)).findFirst().orElse(Status.ToKeep);
    }

    public BigFile(final BigFile file, final Status status) {
        this.id = file.id;
        this.fileId = file.fileId;
        this.status = status;
        this.outdated = file.outdated;
    }

    public String getId() {
        return id;
    }

    public String getFileId() {
        return fileId;
    }

    public Status getStatus() {
        return status;
    }

    public boolean isOutdated() {
        return outdated;
    }

    @Override
    public String toString() {
        return "PurgeResult{" +
                "id='" + id + '\'' +
                ", fileId='" + fileId + '\'' +
                ", status=" + status +
                ", outdated=" + outdated +
                '}';
    }

    public JsonObject toJSON(){
        return JsonObject.mapFrom(this);
    }

    public static BigFile fromJSON(final JsonObject json){
        return json.mapTo(BigFile.class);
    }
}
